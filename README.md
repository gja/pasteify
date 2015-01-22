# pastify

[Browserify][] transform for pasting in a relative html file. The main usecase for this is the ability to write
all your react HTML into a separate file, which can be "pasted" into the code. Make sure this transform is
called before you call the reactify transform.

      // In myhtml.html
      <Hello name="World" />

      // In JS
      pastify("myhtml.html", Hello);

Save the snippet above as `main.js` and then produce a bundle with the following
command:

    % browserify -t pastify main.js

`pasteify` transform activates for files with either `.js` or `.jsx` extensions.

If you want to pasteify modules with other extensions, pass an `-x /
--extension` option:

    % browserify -t coffeeify -t [ pasteify --extension coffee ] main.coffee

If you don't want to specify extension, just pass `--everything` option:

    % browserify -t coffeeify -t [ pasteify --everything ] main.coffee


[Browserify]: http://browserify.org
[jstransform]: https://github.com/facebook/jstransform
