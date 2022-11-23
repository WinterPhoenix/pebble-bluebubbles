#
# This file is the default set of rules to compile a Pebble project.
#
# Feel free to customize this to your needs.
#
import os
import shutil
import waflib

top = '.'
out = 'build'


def distclean(ctx):
    if os.path.exists('dist.zip'):
        os.remove('dist.zip')
    if os.path.exists('dist'):
        shutil.rmtree('dist')
    waflib.Scripting.distclean(ctx)


def options(ctx):
    ctx.load('pebble_sdk_lib')


def configure(ctx):
    ctx.env.CFLAGS = ['-std=c11',
                      '-fms-extensions',
                      '-Wno-address',
                      '-Wno-type-limits',
                      '-Wno-missing-field-initializers']
    ctx.load('pebble_sdk_lib')

    for _, env in ctx.all_envs.iteritems():
        if '-std=c99' in env.CFLAGS:
            env.CFLAGS.remove('-std=c99')

    ctx.find_program('coffee', var='COFFEE', path_list='node_modules/.bin')


def build(ctx):
    ctx.load('pebble_sdk_lib')

    cached_env = ctx.env
    for platform in ctx.env.TARGET_PLATFORMS:
        ctx.env = ctx.all_envs[platform]
        ctx.set_group(ctx.env.PLATFORM_NAME)
        lib_name = '{}/{}'.format(ctx.env.BUILD_DIR, ctx.env.PROJECT_INFO['name'])
        ctx.pbl_build(source=ctx.path.ant_glob('src/c/**/*.c'), target=lib_name, bin_type='lib')
    ctx.env = cached_env

    ctx.set_group('bundle')
    ctx.pbl_bundle(includes=ctx.path.ant_glob('include/**/*.h'),
                   js=ctx.path.ant_glob(['src/js/**/*.js', 'src/js/**/*.json']),
                   bin_type='lib')

    if ctx.cmd == 'clean':
        for n in ctx.path.ant_glob(['dist/**/*', 'dist.zip'], quiet=True):
            n.delete()
