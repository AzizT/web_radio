<?php
$resultat = $bdd->prepare("SELECT title, mp3 FROM track as t, album as a WHERE a.id = t.idAlbum ORDER BY RAND()");
// $resultat = $bdd->prepare("SELECT * FROM tracks WHERE id_tracks = :id_tracks");
$resultat->execute();
$tracks = $resultat->fetch(PDO::FETCH_ASSOC);
?>
    <!-- la section qui va accueillir le lecteur mp3 -->
    <section class="col-md-6 offset-3 lecteur_mp3">

        <!-- une row par titre -->
        <div class="row">

            <!-- première colonne pour le titre -->
            <div class="col-md-6 ml-4 pt-1 title_tracks">
                <span><?php echo $tracks['title']; ?></span>
            </div>

            <!-- deuxieme colonne pour le lecteur -->
            <div class="">
                <div id="sm2-container"></div>
                <div class="song ui360 exclude button-exclude inline-exclude"><a href="../mp3/<?php echo $tracks['mp3'] ?>"></a></div>
            </div>

            <!-- troisieme colonne pour link vers les lyrics -->
            <!-- <div class="col-md-1 title_tracks">
                                                                                    <span>lyrics</span>
                                                                                </div> -->

        </div>
        <!-- fermeture de row -->

    </section>
    <!-- ******************************************fin du lecteur mp3***************************** -->

