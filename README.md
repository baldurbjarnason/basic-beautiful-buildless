---
title: "Basic, Beautiful & Buildless"
description: "Just add package names"
layout: layout.njk
permalink: "/"
---

<div class="Front">


<nav class="Nav"><ul><li><a href="/instant-import-map/" class="Front-nav">Instant Import Map</a></li> <li><a href="/how-many-kib/" class="Front-nav">How many KiB?</a></li> <li><a href="https://baldurbjarnason.com/" class="Front-nav">Blog</a></li></ul></nav>

<h1 id="site-Front" class="Front-heading">
<span class="Front-heading-part">Basic,</span>
<span class="Front-heading-part">Beautiful <em>&amp;</em></span>
<span class="Front-heading-part"><strong>Buildless</strong></span>
</h1>

&mdash;_How big is this damn autocomplete library?!_

&mdash;_I need to polish this form a bit but if I have to add a dependency, then I need to set up some sort of build process, and then this "small" project is no longer small._

&mdash;_Do I really want to add a script directly from a CDN? What happens if they change something? Is it even safe?_

&mdash;_Why is everything to do with JavaScript such a pain in the ass?!_

## When there's nothing small or fun about putting together a "fun small website"

There is a diversity of lightweight static site generators available. My personal favourite -- the one I used to make this site -- is [_Eleventy_](https://www.11ty.dev/)  but there's one in every programming language.

Static site builders handle HTML and markup quite well. That's what they do. Even CSS can be handled quite well by many of them.

But as soon as you need to add scripting things get quite complicated.

All of our dependency management systems are built around bundling and `npm` and there is no such thing as a straightforward bundler. Even the most lightweight and accessible of bundlers turns a fun small project into a not-so-fun major project.

And don't even get me started on `webpack`.

You could switch to a more 'batteries included' static site framework, but most of those end up requiring literal megabytes of JavaScript and, again, we've left "fun" and "small" behind in the rear view mirror.

People talk about "buildless", using browser support for modules instead of a bundler, but it's hard to know even where to start.

## The "Buildless" utopia feels so distant

JavaScript on the web has never been _simple_. Even before ES module bundling, we had `browserify` and Common JS modules. Before that we were using jQuery plugins and loading everything into global variables, which is as messy as that sounds.

And before that, at the beginning, browsers barely had any cross-platform compatibility.

Web dev has never really been small or simple.

But it did use to be small<em>er</em> and simpl<em>er</em> and it definitely used to be entirely _buildless_.

If you wanted to add autocomplete to a text input on a simple site, you just added a jQuery plugin, maybe even linking to it directly from a CDN (_Content Delivery Network_).

Of course, it was that straightforward because you were ignoring a bunch of problems:

- _Messy._ Over time, even "small" jQuery projects became hard to manage.
- _Insecure._ Even with `https`, which wasn't a given back then, linking directly to a script on a CDN was insecure.
- _Global._ Everything you added had to hang off the page's global state and untangling that could get complicated.
- _Opaque use of bandwidth._ Even though jQuery plugin scripts never had the file sizes you see in modern JavaScript packages, any time you load a dependency off a CDN or package manager, you lose a bit of insight into its file sizes you would have had if you were working with its files directly.

But, still...

The uncomplicated workflow of "just link to this plugin, everything will work" is hard to beat.

If only it could be done safely, securely, and _simply_.

_It can't._

## Small tools for small projects

But, it can be done automatically and, more importantly, it can be done in the browser.

That means somebody else -- like me, for instance -- could build tools that does the complicated and involved things necessary for you to be able to:

- Figure out the correct URLs for loading the package.
- Pinning their version so you know what you're getting.
- Load them safely, using [subresource integrity (SRI) hashes](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) that prevent the browser from even loading them if they've been changed.
- Map them to friendly package names you can use in your scripts using [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap).
- Automatically include a [polyfill for import maps](https://github.com/guybedford/es-module-shims?tab=readme-ov-file) so you don't have to create a separate bundle for older browsers.
- Create [`modulepreload` link elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload) for every dependency module that a package imports to minimise the performance impact of not bundling everything.
- Calculates the overall payload size of each individual packages so you know what you're in for even before you add it to your project.

And then deliver all of those features in a single textbox containing the markup you need to copy and paste into the head of your small website so you can get on with the fun part of actually making something.

That's what the [_Instant Import Map_](/instant-import-map/) generator is for.

You only need to type in the package names, optionally, version numbers, and click the button. You'll get an overview of the payload size and the markup you need to copy in a `textarea`.

It's not going to be enough for complex projects or web apps, but it should help you get up and running using JS modules and imports when making a small website or a quick project.

Once the markup is in the `head` of your template, you can import your module scripts using a `type="module"` script anywhere below it and the import map will mean you can use whichever package you're importing using their names, not their URL:

```js
import DOMPurify from "dompurify";

function sanitizeFragment (markup) {
	return DOMPurify.sanitize(markup, {
		FORBID_TAGS: ["style"],
		FORBID_ATTR: ["style"],
		RETURN_DOM_FRAGMENT: true,
	});
}

```

It can look just like your regular, run-of-the-mill bundled code.

Just try it out for yourself:

<a href="/instant-import-map/" class="Front-nav">Instant Import Map</a>

And if you just want the size calculator, you can find that over here:

<a href="/how-many-kib/" class="Front-nav">How many KiB?</a>

## Caveats

- The _Instant Import Map_ tool uses the [`esm.sh`](https://esm.sh/) CDN. Not everything works with it. Most ES module packages should, though.
- The tool has a module walker that parses through the `imports`, both static and dynamic, of a module and if the import values are URL strings, it will fetch and walk through them as well.
- My quick and dirty module walker doesn't handle `wasm` files so if you import a package that uses `wasm` that file won't be included in the preload elements or in the size calculations.
- The module walker itself is a bit messy. It has test coverage but I'm sure you can find packages that break it.
- It includes the `importmap` polyfill by default. If you don't need it, you can edit it from the markup yourself.
- The [`esm.sh`](https://esm.sh/) CDN minifies scripts automatically but doesn't do tree-shaking without additional configuration, so none of the imports or calculations use tree-shaking.

I'm sure there are more that I'm forgetting. If you run into issues, let me know. Just bear in mind that this isn't intended for large apps or big projects.

If you find this tool helpful, let me know! I have ideas for a few other "buildless" tools, but it's hard to tell whether people actually like what you've done, esp. when you haven't bothered to add analytics. 🙂



<div class="Front-newsletter">

## Don't miss a thing

If you find this site useful, you might want to either subscribe to my [blog](https://wwww.baldurbjarnason.com/) or to my weekly newsletter. If you join the newsletter you'll get a free PDF of <strong>three bonus essays</strong> from my book <em>Out of the Software Crisis.</em>

{% include 'newsletter.njk' %}

</div>


{% include 'footer.njk' %}

</div>


