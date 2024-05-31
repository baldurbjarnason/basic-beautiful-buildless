---
title: "Instant Import Maps"
description: "Just add package names"
layout: layout.njk
permalink: "/"
---

<div class="Title">

<h1 id="site-title" class="Title-heading"><em>Instant</em> <span class="Title-main">Import Maps</span></h1>

<p class="Title-description">{{description}}</p>

</div>

<form action="/process/" method="get" class="Form">
	<label class="FormLabel" for="specifiers">
		Package names
	</label>
		<p><input name="specifiers" value="" type="text" id="specifiers" aria-describedby="input-description"></p>

<div id="input-description">

Enter the `npm` names of the packages you want to use in your module scripts, separated by spaces. You can specify the version you want by appending `@x.y.z` to the end where `x.y.z` stands for the version number. For example: `dompurify@3.1.4`.

</div>
<button>Instant Import Map!</button>

Made by [Baldur Bjarnason](https://baldurbjarnason.com/)

</form>


