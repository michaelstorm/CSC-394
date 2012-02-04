# Django settings for mixboard project.

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Michael Storm', 'oopsdude@gmail.com'),
)

SERVER_EMAIL = 'django@mixboard.com'

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'mixboard',                      # Or path to database file if using sqlite3.
        'USER': 'root',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '3306',                      # Set to empty string for default. Not used with sqlite3.
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = False

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = '/home/mattosaurus/projects/school/CSC394/CSC-394/mix-board/django/mixboard/static'

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/'

# URL prefix for admin static files -- CSS, JavaScript and images.
# Make sure to use a trailing slash.
# Examples: "http://foo.com/static/admin/", "/static/admin/".
ADMIN_MEDIA_PREFIX = '/static/admin/media'


# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '%rt!xbw*ekgb9*-5u92w_!_(xkxuupna0)oguf-)8+2i_)iz8u'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'mixboard.main.DisableCRSF',
)

ROOT_URLCONF = 'mixboard.urls'

TEMPLATE_DIRS = (
    '/home/mattosaurus/projects/school/CSC394/CSC-394/mix-board/django/mixboard/templates',
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    #'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.admindocs',
    'pipeline',
)

PIPELINE_JS = {
  'editor': {
    'source_filenames': (
      'static/jquery-1.7.1.js',
      'static/mwheelIntent.js',
      'static/jquery.mousewheel.js',
      'static/jquery.jscrollpane.min.js',
      'static/jquery.jplayer.js',
      'static/editorCSS.js',
      'static/editor.coffee',
      'static/login.coffee',
      'static/signup.coffee',
    
    ),
    'output_filename': 'static/editor_all.js',
  },

  'header': {
    'source_filenames': (
      'static/jquery-1.7.1.js',
      'static/login.coffee',
      'static/signup.coffee',
    ),
    'output_filename': 'static/header_all.js',
  },
}

PIPELINE_CSS = {
  'styles': {
    'source_filenames': (
      'static/header.less',
      'static/editor.less',
    ),
    'output_filename': 'static/style.css',
  },
}

PIPELINE_COMPILERS = (
  'pipeline.compilers.coffee.CoffeeScriptCompiler',
  'pipeline.compilers.less.LessCompiler',
)

PIPELINE_ROOT = '/home/mattosaurus/projects/school/CSC394/CSC-394/mix-board/django/mixboard'
PIPELINE_JS_COMPRESSOR = ''
PIPELINE_CSS_COMPRESSOR = ''
PIPELINE_COFFEE_SCRIPT_BINARY='/usr/bin/coffee'
PIPELINE_LESS_BINARY='/usr/bin/lessc'
PIPELINE_CSS_TO_JS_BINARY = '/home/mattosaurus/projects/school/CSC394/CSC-394/mix-board/django/mixboard/css_to_js.js'

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
#LOGGING = {
#    'version': 1,
#    'disable_existing_loggers': False,
#    'handlers': {
#        'mail_admins': {
#            'level': 'ERROR',
#            'class': 'django.utils.log.AdminEmailHandler',
#            'include_html': True,
#        },
#       'file':{
#            'level': 'DEBUG',
#            'class': 'logging.FileHandler',
#           'filename': '/tmp/django_debug.log',
#       }
#   },
#   'loggers': {
#        'django.request': {
#            'handlers': ['file'],
#           'level': 'WARN',
#           'propagate': True,
#       },
#    }
#}

AUTH_PROFILE_MODULE = 'mixboard.UserProfile'
LOGIN_URL = '/signup/'
