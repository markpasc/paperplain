import subprocess

from paver.easy import *


def call(*args, **kwargs):
    return subprocess.call(args, **kwargs)


@task
def build():
    """Package up the app."""
    call('palm-package', '.')

@task
def halt():
    call('palm-launch', '--device=emulator', '-c', 'org.markpasc.paperplain')

@task
@needs('halt')
def uninstall():
    call('palm-install', '--device=emulator', '-r', 'org.markpasc.paperplain')

@task
@needs('build', 'uninstall')
def push():
    """Reinstall the app and start it."""
    call('palm-install', '--device=emulator', 'org.markpasc.paperplain_1.0.0_all.ipk')
    call('palm-launch', '--device=emulator', 'org.markpasc.paperplain')

@task
def tail():
    """Follow the device's log."""
    call('palm-log', '--device=emulator', '--system-log-level', 'info')
    call('palm-log', '--device=emulator', '-f', 'org.markpasc.paperplain')
