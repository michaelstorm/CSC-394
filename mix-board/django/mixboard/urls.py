from django.conf.urls.defaults import patterns, include, url
from mixboard.main import workingDir
import subprocess

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$|^/$',           'mixboard.main.home'),
    url(r'^(favicon\.ico)$', 'mixboard.main.serveStatic'),
    url(r'^static/(.+)/$',   'mixboard.main.serveStatic'),
    url(r'^markdownify/$',   'mixboard.main.markdownify_request'),
    url(r'^play/$',          'mixboard.sound.play'),
    url(r'^output/(.+)/$',   'mixboard.sound.output'),
    url(r'^login/$',         'mixboard.users.login'),
    url(r'^logout/$',        'mixboard.users.logout'),
    url(r'^register/$',      'mixboard.users.register'),
    url(r'^signup/$',        'mixboard.users.signup'),

    url(r'^song/create/$',             'mixboard.song.create'),
    url(r'^song/save/$',               'mixboard.song.save'),
    url(r'^song/update/$',             'mixboard.song.update'),
    url(r'^song/edit/(\d+)/$',         'mixboard.song.edit'),
    url(r'^song/fork/$',               'mixboard.song.fork'),
    url(r'^song/list/$',               'mixboard.song.list'),
    url(r'^song/get/(\d+)/$',          'mixboard.song.get'),
    url(r'^song/show/(\d+)/',          'mixboard.song.show'),

    url(r'^song/vote/up/(.+)/(.+)/$',      'mixboard.song.vote_up'),
    url(r'^song/vote/down/(.+)/(.+)/$',    'mixboard.song.vote_down'),
    url(r'^song/comment/add/$',            'mixboard.song.add_comment'),
    url(r'^song/comment/delete/$',         'mixboard.song.delete_comment'),
    url(r'^song/comment/edit/$',           'mixboard.song.edit_comment'),
    url(r'^song/comment/list/(.+)/(.+)/$', 'mixboard.song.list_comments'),
    url(r'^song/trending/(.+)/$',          'mixboard.song.trending_table'),
    url(r'^song/trending/$',               'mixboard.song.trending'),

    url(r'^user/profile/(\d+)/',     'mixboard.users.profile'),
    url(r'^user/update/profile/$',   'mixboard.users.update_profile'),
    url(r'^user/list/$',             'mixboard.users.list'),

    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/',     include(admin.site.urls)),
)

def handler500(request):
    from django.template import Context, loader
    from django.http import HttpResponseServerError

    t = loader.get_template('500.html')
    return HttpResponseServerError(t.render(Context({
        'request': request,
    })))
