from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',

    url(r'^$|^/$', 'mixboard.main.home'),
    url(r'^static/(.+)/$', 'mixboard.main.serveStatic'),
    url(r'^play/$', 'mixboard.sound.play'),

    # Examples:
    # url(r'^$', 'mixboard.views.home', name='home'),
    # url(r'^mixboard/', include('mixboard.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
