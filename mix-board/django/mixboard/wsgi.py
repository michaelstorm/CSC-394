import os, sys
sys.path.append('/usr/local/Django-1.3.1/django')
sys.path.append('/home/michael/CSC-394/mix-board/django')
os.environ['DJANGO_SETTINGS_MODULE'] = 'mixboard.settings'

import django.core.handlers.wsgi
from raven.contrib.django.middleware.wsgi import Sentry

application = Sentry(django.core.handlers.wsgi.WSGIHandler())

def test_application(environ, start_response):
    import cStringIO
    headers = []
    headers.append(('Content-Type', 'text/plain'))
    write = start_response('200 OK', headers)

    input = environ['wsgi.input']
    output = cStringIO.StringIO()

    print >> output, "PID: %s" % os.getpid()
    print >> output

    keys = environ.keys()
    keys.sort()
    for key in keys:
        print >> output, '%s: %s' % (key, repr(environ[key]))
    print >> output

    output.write(input.read(int(environ.get('CONTENT_LENGTH', '0'))))

    return [output.getvalue()]
