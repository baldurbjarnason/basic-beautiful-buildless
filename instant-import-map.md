---
title: "Instant Import Map"
description: "Just add package names"
layout: layout.njk
---

<div class="InstantMap">

<a href="/" class="InstantMap-nav">&lt; Back</a>

<h1 id="site-InstantMap" class="InstantMap-heading"><em>Instant</em> <span class="InstantMap-main">Import Map</span></h1>

<p class="InstantMap-description">{{description}}</p>

</div>

<form action="/process/" method="get" class="Form">

<div><label class="FormLabel" for="specifiers">
		Package names
		<input name="specifiers" value="" type="text" id="specifiers" aria-describedby="input-description">
	</label>

<label class="FormLabel">
	<input name="json" type="checkbox" id="json-input"> <span class="Form-checkbox-text">Return markup and map as a JSON object</span>
	</label></div>

<div id="input-description">

Enter the `npm` names of the packages you want to use in your module scripts, separated by spaces. You can specify the version you want by appending `@x.y.z` to the end where `x.y.z` stands for the version number. For example: `dompurify@3.1.4`.

</div>
<button>Instant Import Map!</button>

{% include 'footer.njk' %}

</form>


