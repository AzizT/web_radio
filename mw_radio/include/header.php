<?php

$title = '';
$album = '';
$annee = '';
$interprete = '';
$photo = '';
$mp3 = '';
$genre1 = '';
$musician1='';
$musician2='';
$musician3='';
$musician4='';
$musician5='';
$musician6='';

if (!empty($_GET)) {
    $title = $_GET['title'];
    $album = $_GET['album'];
    $annee = $_GET['annee'];
    $interprete = $_GET['interprete'];
    $photo = $_GET['photo'];
    $mp3 = $_GET['mp3'];
    $genre1 = $_GET['genre1'];
    $musician1= $_GET['musician1'];
    $musician2= $_GET['musician2'];
    $musician3= $_GET['musician3'];
    $musician4= $_GET['musician4'];
    $musician5= $_GET['musician5'];
    $musician6= $_GET['musician6'];
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>MW Radio Albums</title>

    <!-- link bootstrap -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

    <!-- link fontawesome -->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css"
        integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">

    <!-- link googlefonts -->
    <link href="https://fonts.googleapis.com/css?family=Satisfy" rel="stylesheet">

    <!-- mon css navigation interne-->
    <link rel="stylesheet" href="../css/style_interne.css">
</head>
<body id="accueil">

    <header id="haut">

        <nav class="navbar navbar-lg navbar-light bg-light col-md-1">
            <!-- <a class="navbar-brand" href="../accueil.php">Menu</a> -->
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
        
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">

                    <li class="nav-item ">
                        <a class="nav-link" href="../accueil.php">Accueil MW Radio</a>
                    </li>
                    <li class="nav-item ">
                            <a class="nav-link" href="../50_60_tracks/index_50_60.php">50' 60' Albums</a>
                    </li>
                    <li class="nav-item ">
                            <a class="nav-link" href="../70_tracks/index_70.php">70' Albums</a>
                    </li>
                    <li class="nav-item ">
                            <a class="nav-link" href="../80_tracks/index_80.php">80' Albums</a>
                    </li>
                    <li class="nav-item ">
                        <a class="nav-link" href="../90_tracks/index_90.php">90' Albums</a>
                    </li>
                    <li class="nav-item ">
                            <a class="nav-link" href="../00_tracks/index_00.php">2000' Albums</a>
                    </li>
                    <li class="nav-item ">
                            <a class="nav-link" href="../10_tracks/index_10.php">2010' Albums</a>
                    </li>
                    
                </ul>
            </div>
        </nav>

    </header>

<div class="container-fluid">