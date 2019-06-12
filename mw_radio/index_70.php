<?php

require_once("../include/init.php");

$resultat = $bdd->prepare("SELECT * FROM tracks WHERE annee BETWEEN :annee1 AND :annee2 ORDER BY annee ASC");
$resultat->bindValue(':annee1', 1970, PDO::PARAM_STR);
$resultat->bindValue(':annee2', 1979, PDO::PARAM_STR);
$resultat->execute();


require_once("../include/header.php");
?>

<h1>70' Albums</h1>
<div class="container">
    <?php while ($tracks = $resultat->fetch(PDO::FETCH_ASSOC)) : ?>




        <div class="tile-wrap">
            <a href="fiche_tracks.php?id_tracks=<?= $tracks['id_tracks'] ?>">
                <img src="<?= $tracks['photo'] ?>" alt="<?= $tracks['album'] . $tracks['genre1'] ?>" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title"><?= $tracks['title'] ?></h2>
                    <p class="tile-description"><?= $tracks['interprete'] . '<br>' . $tracks['annee'] . '<br>' . $tracks['album'] . '<br>' . $tracks['genre1'] ?></p>
                </div>
            </a>
        </div>


    <?php endwhile; ?>
</div>


<?php
require_once("../include/footer.php");
?>