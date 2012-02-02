from mixboard import settings
from pipeline.compilers import SubProcessCompiler

sdfsdfsdsdfsdf

class CssToJsCompiler(SubProcessCompiler):
    output_extension = 'css_js'

    def match_file(self, path):
        return path.endswith('.css')

    def compile_file(self, content, path):
        command = settings.PIPELINE_CSS_TO_JS_BINARY + " " + path
        return self.execute_command(command, content)
