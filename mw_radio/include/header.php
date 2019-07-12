<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>MW Radio Albums</title>

    <!-- link bootstrap -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

    <!-- link fontawesome -->
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">

    <!-- link googlefonts -->
    <link href="https://fonts.googleapis.com/css?family=Satisfy" rel="stylesheet">

    <!-- mon css navigation interne-->
    <link rel="stylesheet" href="../css/style_interne.css">
</head>

<body id="accueil">

    <header id="haut">

        <nav class="navbar navbar-expand-lg navbar-light bg-light col-md-12">
            <!-- si je veux remettre une nav expand, ligne de code ci dessous + modifier le css -->
            <!-- <nav class="navbar navbar-expand-lg navbar-light bg-light"> -->

            <!-- <a class="navbar-brand" href="../accueil.php">Menu</a> -->
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">

                    <li class="nav-item ">
                        <a class="nav-link" href="../accueil.php"><button class="btn btn-sm btn-outline-success" type="button">Accueil MW Radio</button></a>
                    </li>

                    <?php
                    if (isset($_GET['action']) && ($_GET['action'] == 'affichage') || isset($_GET['action']) && ($_GET['action'] == 'ajout') || isset($_GET['page']) && ($_GET['page'] == 'admin/gestion_album.php')) : ?>

                        <li class="nav-item ">
                            <a class="nav-link" href="../navigation_interne/index_50_60.php"><button class="btn btn-sm btn-outline-success" type="button">50' 60' Albums</button></a>
                        </li>
                        <li class="nav-item ">
                            <a class="nav-link" href="../index_70.php"><button class="btn btn-sm btn-outline-success" type="button">70' Albums</button></a>
                        </li>
                        <li class="nav-item ">
                            <a class="nav-link" href="../index_80.php"><button class="btn btn-sm btn-outline-success" type="button">80' Albums</button></a>
                        </li>
                        <li class="nav-item ">
                            <a class="nav-link" href="../index_90.php"><button class="btn btn-sm btn-outline-success" type="button">90' Albums</button></a>
                        </li>
                        <li class="nav-item ">
                            <a class="nav-link" href="../index_00.php"><button class="btn btn-sm btn-outline-success" type="button">00' Albums</button></a>
                        </li>
                        <li class="nav-item ">
                            <a class="nav-link" href="../index_10.php"><button class="btn btn-sm btn-outline-success" type="button">10' Albums</button></a>
                        </li>

                    <?php endif; ?>

                    <li class="nav-item ">
                        <a class="nav-link" href="index_50_60.php"><button class="btn btn-sm btn-outline-success" type="button">50' 60' Albums</button></a>
                    </li>
                    <li class="nav-item ">
                        <a class="nav-link" href="index_70.php"><button class="btn btn-sm btn-outline-success" type="button">70' Albums</button></a>
                    </li>
                    <li class="nav-item ">
                        <a class="nav-link" href="index_80.php"><button class="btn btn-sm btn-outline-success" type="button">80' Albums</button></a>
                    </li>
                    <li class="nav-item ">
                        <a class="nav-link" href="index_90.php"><button class="btn btn-sm btn-outline-success" type="button">90' Albums</button></a>
                    </li>
                    <li class="nav-item ">
                        <a class="nav-link" href="index_00.php"><button class="btn btn-sm btn-outline-success" type="button">00' Albums</button></a>
                    </li>
                    <li class="nav-item ">
                        <a class="nav-link" href="index_10.php"><button class="btn btn-sm btn-outline-success" type="button">10' Albums</button></a>
                    </li>

                </ul>
            </div>
        </nav>

    </header>

    <div class="container-fluid">