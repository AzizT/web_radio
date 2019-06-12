<?php

require_once("include/init.php");

$resultat = $bdd->prepare("SELECT * FROM album WHERE annee BETWEEN :annee1 AND :annee2 ORDER BY annee ASC");
$resultat->bindValue(':annee1', 1950, PDO::PARAM_STR);
$resultat->bindValue(':annee2', 1969, PDO::PARAM_STR);
$resultat->execute();


require_once("include/header.php");
?>

<h1>50' 60' Albums</h1>
<div class="container">
    <?php while ($tracks = $resultat->fetch(PDO::FETCH_ASSOC)) : ?>




        <div class="tile-wrap">
            <a href="fiche_tracks.php?id=<?= $tracks['id'] ?>">
                <img src="img_lp/<?= $tracks['photo'] ?>" alt="<?= $tracks['name'] . $tracks['genre1'] ?>" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title"><?= $tracks['title'] ?></h2>
                    <p class="tile-description"><?= $tracks['interprete'] . '<br>' . $tracks['annee'] . '<br>' . $tracks['name'] . '<br>' . $tracks['genre1'] ?></p>
                </div>
            </a>
        </div>


    <?php endwhile; ?>
</div>


<?php
require_once("include/footer.php");
?>