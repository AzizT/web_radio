<?php
require_once("../include/header2.php");
require_once("../include/init.php");
extract($_POST);

extract($_GET);

?>

<ul class="col-md-4 offset-md-4 list-group mt-4 gestion_globale">

    <li class="list-group-item bg-dark mt-4 text-center"><a href="gestion_album.php">Gestion Albums</li>

    <li class="list-group-item bg-dark mt-4 text-center"><a href="gestion_track.php">Gestion Tracks</a></li>

    <li class="list-group-item bg-dark mt-4 text-center"><a href="gestion_membre.php">Gestion Membres</a></li>



</ul>


<?php
require_once("../include/footer.php");
