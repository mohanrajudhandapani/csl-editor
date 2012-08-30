<!doctype html>
<!--
	This is a bare-bones example, for a more complete implementation see 
	https://github.com/citation-style-editor/csl-editor-demo-site
-->
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> 

	<title>CSL Search by Name (bare-bones example page)</title>

	<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.8.22/themes/ui-lightness/jquery-ui.css">
	<link rel="stylesheet" type="text/css" href="../external/jstree/themes/default/style.css" />

	<link rel="stylesheet" type="text/css" href="../css/base.css?bust=$GIT_COMMIT" />
	<link rel="stylesheet" type="text/css" href="../css/searchResults.css?bust=$GIT_COMMIT" />
	<link rel="stylesheet" type="text/css" href="../css/searchByName.css?bust=$GIT_COMMIT" />

	<script type="text/javascript" src="../external/require-jquery.js"></script>
	<script>
		require.config({
			baseUrl: "..",
			urlArgs : "bust=$GIT_COMMIT"
		});
		requirejs(['src/config'], function (config) {
			require(['src/SearchByName'], function (CSLEDIT_SearchByName) {
				var searchByName = new CSLEDIT_SearchByName('#searchByNameContainer', {});
			});
		});
	</script>
</head>
<body>
<div id="searchByNameContainer">
</div>
</body>
</html>
