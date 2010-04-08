import subprocess

from paver.easy import *


def call(*args, **kwargs):
    return subprocess.call(args, **kwargs)


@task
def push():
    """Install the app and start it."""
    call('palm-package', '.')
    call('palm-install', '--device=emulator', '-r', 'org.markpasc.paperplain')
    call('palm-install', '--device=emulator', 'org.markpasc.paperplain_1.0.0_all.ipk')
    call('palm-launch', '--device=emulator', 'org.markpasc.paperplain')
