"""Build the AgentCore Runtime code package: agent/main.py plus arm64 Linux dependencies, as a zip.

Usage: python scripts/build_agent.py   (prints the zip path on the last line)
The zip name carries a content hash, so CloudFormation sees a new S3 key whenever the code changes.
"""
import hashlib
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
build = root / ".build" / "agent"
shutil.rmtree(build, ignore_errors=True)
build.mkdir(parents=True)

subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "--target", str(build),
                "--platform", "manylinux2014_aarch64", "--implementation", "cp", "--python-version", "3.13",
                "--only-binary=:all:", "-r", str(root / "agent" / "requirements.txt")], check=True)
for source in (root / "agent").glob("*.py"):  # main.py and its modules
    shutil.copy(source, build / source.name)
# The job-fit workflow grades evidence against Clair's profile: the site's hand-written llms.txt.
shutil.copy(root.parent / "llms.txt", build / "profile.txt")

tmp = root / ".build" / "agent.zip"
with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
    # bin/ holds console scripts pip generated for Windows (.exe); useless on the Linux runtime.
    files = (p for p in build.rglob("*") if p.is_file() and "__pycache__" not in p.parts
             and p.relative_to(build).parts[0] != "bin")
    for path in sorted(files):
        info = zipfile.ZipInfo(path.relative_to(build).as_posix(), date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16  # AgentCore Runtime needs 644 on files
        z.writestr(info, path.read_bytes())
digest = hashlib.sha256(tmp.read_bytes()).hexdigest()[:12]
out = root / ".build" / f"agent-{digest}.zip"
tmp.replace(out)
print(out)
