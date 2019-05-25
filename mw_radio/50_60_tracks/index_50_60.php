<?php
require_once("../include/header.php");
?>

<?php
        if(empty($_GET))
        {
    ?>

    <h1>50' 60' Albums</h1>

    <!-- <h2 class="indication">Rangés chronologiquement.<br>
    Cliquez sur l' album pour<br>
    accéder aux titres.</h2> -->

    <div class="container">
        <div class="tile-wrap">
            <a href="?title=Babaratiri&album=Il Re Del Mambo&annee=1953&interprete=Beny More&photo=img_lp/babaratiri.jpg&mp3=mp3/Babaratiri.mp3&genre1=Mambo&musician1=Beny Moré - Vocals&musician2=Eduardo Cabrera - Piano&musician3=Alberto Limonta - Bass&musician4=Clemente 'Chicho' Piquero - Bongo&musician5=Rolando Laserie - Drums&musician6= and many others...">
            <!-- https://www.youtube.com/watch?v=d4jN82OQQ04 -->
                <img src="img_lp/babaratiri.jpg" alt="album Il Re del Mambo de Perez Prado (mambo)" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title">Beny Moré & Perez Prado</h2>
                    <p class="tile-description">Babaratiri<br>1953<br>Il Re Del Mambo<br>Mambo</p>
                </div>
            </a>
        </div>
        <div class="tile-wrap">
            <a href="?title=Powell's Prance&album=At Basin Street&annee=1956&interprete=Clifford Brown and Max Roach&photo=img_lp/powellsPrance.jpg&mp3=mp3/Powells_Prances.mp3&genre1=Jazz Bop&musician1=Clifford Brown - Trumpet&musician2=Sonny Rollins - Tenor sax&musician3=Richie Powell - Piano&musician4=George Morrow - Bass&musician5=Max Roach - Drums&musician6=">
                <img src="img_lp/powellsPrance.jpg" alt="album At Basin street de Clifford Brown et Max Roach (Jazz)" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title">C. Brown & M. Roach</h2>
                    <p class="tile-description">Powell's Prance<br>1956<br>At basin Street<br>Jazz</p>
                </div>
            </a>
        </div>
        <div class="tile-wrap">
            <a href="?title=Stormy Monday Blues&album=Here's The Man&annee=1962&interprete=Bobby Blue Bland&photo=img_lp/stormyMondayBlues.jpg&mp3=mp3/Stormy_Monday_Blues.mp3&genre1=Soul Blues&musician1=Bobby Blue Bland - Vocals&musician2=Wayne Benett - Guitar&musician3=Hamp Simmons - Bass&musician4=Teddy Reynolds - Piano&musician5=John 'Jabo' Starks - Drums&musician6=and others...">
            <!-- https://www.jazzmessengers.com/en/74782/bobby-bland/heres-the-man -->
                <img src="img_lp/stormyMondayBlues.jpg" alt="album Here's the man de Bobby Blue Bland (Soul Blues)" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title">Bobby Blue Bland</h2>
                    <p class="tile-description">Stormy Monday Blues<br>1962<br>Here's The Man<br>Soul Blues</p>
                </div>
            </a>
        </div>
        <div class="tile-wrap">
            <a href="?title=Ysabel's Table Dance&album=Tijuana Moods&annee=1962&interprete=Charles Mingus&photo=img_lp/ysabelTableDance.jpg&mp3=mp3/Ysabels_Table_Dance.mp3&genre1=Jazz&musician1=Charles Mingus - Bass&musician2=Clarence Shaw - Trumpet&musician3=Jimmy Knepper - Trombone&musician4=Dannie Richmond - Drums&musician5=Ysabel Morel - Castanets, vocals&musician6=and others...">
                <img src="img_lp/ysabelTableDance.jpg" alt="album Tijuana Mood de Charles Mingus (Jazz intro Flamenco)" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title">Charles Mingus</h2>
                    <p class="tile-description">Ysabel's Table Dance<br>1962<br>Tijuana Moods<br>Jazz intro Flamenco</p>
                </div>
            </a>
        </div>
        <div class="tile-wrap">
            <a href="?title=Swing Low Sweet Cadillac&album=Swing Low Sweet Cadillac&annee=1967&interprete=Dizzy Gillespie&photo=img_lp/swingLowSweetCadillac.jpg&mp3=mp3/Swing_Low_Sweet_Cadillac.mp3&genre1=Jazz Bop&musician1=Dizzy Gillespie - Trumpet, vocals&musician2=James Moody - Saxophone, vocals&musician3=Mike Longo - Piano&musician4=Frank Schifano - Bass&musician5=Otis Candy Finch Jr. - Drums&musician6=">
                <img src="img_lp/swingLowSweetCadillac.jpg" alt="album Swing Low Sweet Cadillac de Dizzy Gillespie (Live Jazz Bop)" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title">Dizzy Gillespie</h2>
                    <p class="tile-description">Swing Low...<br>1967<br>Swing Low...<br>Jazz Bop</p>
                </div>
            </a>
        </div>
        <div class="tile-wrap">
            <a href="?title=Bra Joe From Kilimandjaro&album=African Piano&annee=1969&interprete=Dollar Brand&photo=img_lp/braJoe.jpg&mp3=mp3/Bra_Joe_From_Kilimanjaro.mp3&genre1=Jazz Free&musician1=Dollar Brand - Piano&musician2=&musician3=&musician4=&musician5=&musician6=">
                <img src="img_lp/braJoe.jpg" alt="album African Piano de Dollar Brand (titre Jazz Free)" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title">Dollar Brand</h2>
                    <p class="tile-description">Bra Joe From...<br>1969<br>African Piano<br>Jazz Free</p>
                </div>
            </a>
        </div>
        <div class="tile-wrap">
            <a href="?title=Born Under A Bad Sign&album=Fear Itself&annee=1969&interprete=Ellen McIlwaine&photo=img_lp/bornUnder.jpg&mp3=mp3/Born_Under_A_Bad_Sign.mp3&genre1=Blues - Rock - Psyché&musician1=Ellen McIlwaine - Guitar, vocals&musician2=&musician3=&musician4=&musician5=&musician6=">
                <img src="img_lp/bornUnder.jpg" alt="album Fear Itself d' Ellen McIlwaine (titre Blues Psyché)" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title">Ellen McIlwaine</h2>
                    <p class="tile-description">Born Under A Bad Sign<br>1969<br>Fear Itself<br>Blues - Rock - Psyché</p>
                </div>
            </a>
        </div>
        
        <!-- <div class="tile-wrap">
            <a href="?title=&album=&annee=&interprete=&photo=&mp3=mp3/&genre1=&musician1=&musician2=&musician3=&musician4=&musician5=&musician6=">
                <img src="img_lp/" alt="album" class="tile-image" />
                <div class="tile-text">
                    <h2 class="tile-title"></h2>
                    <p class="tile-description"></p>
                </div>
            </a>
        </div> -->
    </div>

    <?php
        } else {
    ?>

    <!-- ***********************************************les éléments random qui doivent apparaitrent après selection d' un album********************************* -->

    <h1><?php echo $interprete; ?></h1>

    <p class="year"><?php echo $annee; ?></p>

    <p class="genre"><?php echo $genre1; ?></p>
    
    <!-- la section qui va accueillir le lecteur mp3 -->
    <section class="col-md-6 offset-3 lecteur_mp3">

        <!-- une row par titre -->
        <div class="row">

            <!-- première colonne pour le titre -->
                <div class="col-md-6 ml-4 pt-1 title_tracks">
                    <span><?php echo $title; ?></span>
                </div>

            <!-- deuxieme colonne pour le lecteur -->
                <div class="">
                    <div id="sm2-container"></div>
                    <div class="song ui360 exclude button-exclude inline-exclude"><a
                            href=<?php echo $mp3 ?> ><span class="titre_album"><?php echo $album; ?></span></a></div>
                </div>

            <!-- troisieme colonne pour link vers les lyrics -->
                <!-- <div class="col-md-1 title_tracks">
                    <span>lyrics</span>
                </div> -->

        </div>
        <!-- fermeture de row -->
    
    </section>
    <!-- ******************************************fin du lecteur mp3***************************** -->

    <!-- la  section, qui va accueillir l' image de l' album random -->
    <section class="container col-md-12">

            <div class="col-md-5">
            
            <p class="personnel"><?php echo $musician1; ?></p>
            <p class="personnel"><?php echo $musician2; ?></p>
            <p class="personnel"><?php echo $musician3; ?></p>
            <p class="personnel"><?php echo $musician4; ?></p>
            <p class="personnel"><?php echo $musician5; ?></p>
            <p class="personnel"><?php echo $musician6; ?></p>
            
            </div>

            <div class="col-md-5 mt-3">

            <img src="<?php echo $photo; ?>" alt="" class="image-random" />

            </div>
                
    </section>

    <!-- *******************************************fin de la section infos + image *********************************** -->

    <!-- **********************************************début de la zone commentaire************************************ -->
    <section class="container-fluid commentaire">
    <div class="form-group text-center">
    <label for="comment">Laissez un commentaire</label>
        <textarea class="form-control col-md-6 mx-auto comment" id="comment" rows="1" placeholder="..."></textarea>
    </div>
    </section>
    <!-- **********************************************fin de la zone commentaire*************************************** -->
    

    

    <!-- **************************************************************************fin de l' album aléatoire*************************************************************************** -->

    <?php
        }
    ?>
    
   
    <?php
require_once("../include/footer.php");
?>