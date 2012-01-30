# mix-board/django/mixboard/static

Contains static files that can be retrieved by the web server and sent to
clients.

- *editor.coffee:* The music editor code, now written in CoffeeScript. For those
                   unfamiliar, CoffeeScript is a handy language that compiles to
                   JavaScript. It's like JS, but more scalable and without the
                   idiosyncracies.
- *editor.less*: The stylesheets describing the mixer layout. Some other things
                 are crammed in there as well, which will be taken out
                 eventually. This is written in LESS, which is like CoffeeScript
                 in that it compiles to another language (CSS, in this case),
                 but unlike CS in that it is completely backwards-compatible. In
                 fact, this file is still pure CSS at the moment. This is likely
                 to change soon.
