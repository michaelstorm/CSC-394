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
    url(r'^logout/$', 'mixboard.users.logout'),
    url(r'^register/$', 'mixboard.users.register'),
    url(r'^signup/$', 'mixboard.users.signup'),
    url(r'^song/save/$', 'mixboard.song.save'),
    url(r'^song/list/$', 'mixboard.song.list'),
    url(r'^song/get/(.+)/$', 'mixboard.song.get'),
    url(r'^user/profile/(.+)/$', 'mixboard.users.profile'),
    url(r'^user/list/$', 'mixboard.users.list'),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)

#proc = subprocess.Popen([workingDir+'/css_js_watch', 'static/'], shell=True, cwd=workingDir)
#print "started css_js_watch"
