import os, sys
sys.path.append('/usr/local/Django-1.3.1/django')
sys.path.append('/home/michael/CSC-394/mix-board/django')
os.environ['DJANGO_SETTINGS_MODULE'] = 'mixboard.settings'

import django.core.handlers.wsgi

application = django.core.handlers.wsgi.WSGIHandler()
