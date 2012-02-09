import os.path

from sentry.conf.server import *

ROOT = os.path.dirname(__file__)

DATABASES = {
    'default': {
        # You can swap out the engine for MySQL easily by changing this value
        # to ``django.db.backends.mysql`` or to PostgreSQL with
        # ``django.db.backends.postgresql_psycopg2``
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'sentry',
        'USER': 'mixboard',
        'PASSWORD': 'm1xb04rdp4ss734',
        'HOST': '',
        'PORT': '3306',
    }
}

SENTRY_KEY = 'UpMD3JGFiP6pw8undl4NFPNno3JOWwmNRlG4WgMLnG+aDHViWCYRmg=='

# Set this to false to require authentication
SENTRY_PUBLIC = True

SENTRY_WEB_HOST = '0.0.0.0'
SENTRY_WEB_PORT = 9000
SENTRY_LOG_DIR = os.path.abspath(os.path.join(ROOT, 'log'))
SENTRY_RUN_DIR = os.path.abspath(os.path.join(ROOT, 'run'))
