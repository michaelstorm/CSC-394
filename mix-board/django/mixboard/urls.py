from django.conf.urls.defaults import patterns, include, url
from mixboard.main import workingDir
import subprocess

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$|^/$', 'mixboard.main.home'),
    url(r'^(favicon\.ico)$', 'mixboard.main.serveStatic'),
    url(r'^static/(.+)/$', 'mixboard.main.serveStatic'),
    url(r'^play/$', 'mixboard.sound.play'),
    url(r'^output/(.+)/$', 'mixboard.sound.output'),
    url(r'^login/$', 'mixboard.users.login'),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)

proc = subprocess.Popen([workingDir+'/css_js_watch', 'static/'], shell=True, cwd=workingDir)
print "started css_js_watch"
