<?php

function minify_html ($data) {
    return preg_replace(
        [ '/\>[^\S ]+/s', '/[^\S ]+\</s', '/(\s)+/s' ],
        [ '>', '<', '\\1' ],
        $data
    );
}

function run_template ($_template, $_data = null) {
    if (!is_null($_data)) extract($_data);
    unset($_data);
    ob_start();
    eval('unset($_template) ?>' . preg_replace(
        ['/@view\((.*)\)/', '/\\\@/', '/@(.*)/', '/\$\$\$/', '/{{(.*)}}/U', '/{!!(.*)!!}/U'],
        ['<?php echo view($1) ?>', '$$$', '<?php $1 ?>', '@', '<?php echo htmlspecialchars($1, ENT_QUOTES, \'UTF-8\') ?>', '<?php echo $1 ?>'],
        $_template
    ));
    $html = ob_get_contents();
    ob_end_clean();
    return $html;
}

function view ($_path, $_data = null) {
    return minify_html(run_template(file_get_contents(ROOT . '/views/' . str_replace('.', '/', $_path) . '.html'), $_data));
}
