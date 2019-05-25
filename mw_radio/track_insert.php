<!-- <!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Formulaire d' insertion</title> -->

    <!-- link bootstrap -->

    <!-- <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

</head>

<body>

    <?php
    require_once("include/init.php");

    extract($_POST);

    extract($_GET);
    
    
    // ***********************enregitrement d' un mp3******************************

    // if ($_POST) {

    //     $mp3_bdd = '';

    //     if (isset($_GET['action']) && $_GET['action'] == 'modification') {

    //             $mp3_bdd = $mp3_actuel; // si on souhaite conserver le même mp3 en cas de modification, on affecte la valeur du champs mp3 'hidden', c'est à dire l'URL du mp3 selectionnée en BDD

    //         }

    //     if (!empty($_FILES['mp3']['name'])) // on vérifie que l'indice 'name' dans la superglobale $_FILES n'est pas vide, cela veut dire que l'on a bien uploader un mp3

    //         {

    //             $nom_mp3 ='-' . $_FILES['mp3']['name']; // on redéfinit le nom du mp3 en concaténant la référence saisi dans le formulaire avec le nom du mp3

    //             echo $nom_mp3 . '<br>';



    //             $mp3_bdd = URL . "mp3/$nom_mp3"; // on définit l'URL du mp3, c'est ce que l'on conservera en BDD

    //             echo $mp3_bdd . '<br>';



    //             $mp3_dossier = RACINE_SITE . "mp3/$nom_mp3"; // on définit le chemin physique du mp3 sur le disque dur du serveur, c'est ce qui nous permettra de copier le mp3 dans le dossier mp3

    //             echo $mp3_dossier . '<br>';



    //             copy($_FILES['mp3']['tmp_name'], $mp3_dossier); // copy() est une fonction prédéfinie qui permet de copier le mp3 dans le dossier mp3. arguments: copy(nom_temporaire_mp3, chemin de destination)


    //         }

            // **********************fin de l' enregistrement du mp3*********************

            // ****************************enregistrement de la photo**********************

        //     $photo_bdd = '';

        // if (isset($_GET['action']) && $_GET['action'] == 'modification') {

        //         $photo_bdd = $photo_actuelle; // si on souhaite conserver la même photo en cas de modification, on affecte la valeur du champs photo 'hidden', c'est à dire l'URLde la photo selectionnée en BDD

        //     }

        // if (!empty($_FILES['photo']['name'])) // on vérifie que l'indice 'name' dans la superglobale $_FILES n'est pas vide, cela veut dire que l'on a bien uploader une photo

        //     {

        //         $nom_photo = $reference . '-' . $_FILES['photo']['name']; // on redéfinit le nom de la photo en concaténant la référence saisi dans le formulaire avec le nom de la photo

        //         echo $nom_photo . '<br>';



        //         $photo_bdd = URL . "photo/$nom_photo"; // on définit l'URL de la photo, c'est ce que l'on conservera en BDD

        //         echo $photo_bdd . '<br>';



        //         $photo_dossier = RACINE_SITE . "photo/$nom_photo"; // on définit le chemin physique de la photo sur le disque dur du serveur, c'est ce qui nous permettra de copier la photo dans le dossier photo

        //         echo $photo_dossier . '<br>';



        //         copy($_FILES['photo']['tmp_name'], $photo_dossier); // copy() est une fonction prédéfinie qui permet de copier la photo dans le dossier photo. arguments: copy(nom_temporaire_photo, chemin de destination)


        //     }

            // *********************fin de l' enregistrement de la photo*******************

            // Requete d'insertion permettant d'inserer le titre, la photo et le mp3 dans les différentes tables (requête préparée) + a l' interieur (else) la requete d' update ( modification de photo et mp3).



    //     if(isset($_GET['action']) && $_GET['action'] == 'ajout')
    //     {
    // $bdd_insert = $bdd->prepare("INSERT into mp3(fichier) VALUES(:fichier)");

    //         $_GET['action'] = 'affichage';

    //     }
        // else{
        //     $bdd_insert = $bdd->prepare("UPDATE mp3 SET fichier = :fichier WHERE id_mp3 = $id_mp3");

        //     $_GET['action'] = 'affichage';

        //     $validate .= "<div class='alert alert-success col-md-6 offset-md-3 text-center'>Le mp3 n° <strong>$id_mp3</strong> a bien été modifié !!</div>";
        // }
    // foreach ($_POST as $key => $value) {

    //         if ($key != 'mp3_actuel') {

    //                 $bdd_insert->bindValue(":$key", $value, PDO::PARAM_STR);
    //             }
    //     }

    // $bdd_insert->bindValue(":fichier", $mp3_bdd, PDO::PARAM_STR);

    // $bdd_insert->execute();




        // $insert_bdd = $bdd->prepare("INSERT INTO tracks (title, mp3) VALUES(:title, :mp3)");



        // $insert_bdd->bindValue(":title", $_POST['title'], PDO::PARAM_STR);

        // $insert_bdd->bindValue(":mp3", $_POST['mp3'], PDO::PARAM_STR);

        // $insert_bdd->execute();
        
        // $resultat = $bdd->query("SELECT title FROM tracks WHERE (musicien1 = 'Ike Willis' )OR (musicien2 = 'Ike Willis' )OR (musicien3 = 'Ike Willis' )OR (musicien4 = 'Ike Willis' )OR (musicien5 = 'Ike Willis' )OR (musicien6 = 'Ike Willis' )OR (musicien7 = 'Ike Willis' )OR (musicien8 = 'Ike Willis' )OR (musicien9 = 'Ike Willis' )OR (musicien10 = 'Ike Willis') OR (musicien11 = 'Ike Willis') OR (musicien12 = 'Ike Willis') OR (musicien13 = 'Ike Willis') OR (musicien14 = 'Ike Willis') OR (musicien15  = 'Ike Willis') ");

        // while($musicien = $resultat->fetch(PDO::FETCH_ASSOC))
        // {
        //     echo "<pre>";
        // print_r($musicien);
        // echo "</pre>";
        // }

        
    // }
    // ?>
    // <?php if (isset($_GET['action']) && ($_GET['action'] == 'ajout')) : ?>



<-- <h1 class="col-md-6 offset-md-4 text-center"> <?= $action ?> d'un produit</h1> -->

<!-- <?php -->

// if (isset($_GET['id_mp3'])) {

//         $resultat = $bdd->prepare("SELECT * FROM produit WHERE  id_produit = :id_produit");

//         $resultat->bindValue(':id_mp3', $id_mp3, PDO::PARAM_INT);

//         $resultat->execute();

//         $mp3_actuel = $resultat->fetch(PDO::FETCH_ASSOC);

//     }

// $mp3 = (isset($mp3_actuel['fichier'])) ? $mp3_actuel['fichier'] : '';



// ?>
// <?php endif; ?> 

    <form class="mt-4 mb-4 ml-4" method="post" action="" enctype="multipart/form-data">

        <-- le titre -->
        <!-- <div class="form-group col-md-2">
            <label for="title">Titre du morceau</label>
            <input type="text" class="form-control" id="title" name="title">
        </div> -->

        

        <!-- upload du mp3 -->
        <!-- <div class="form-group col-md-2">
            <label for="mp3">Upload du mp3</label>
            <input type="file" class="form-control" id="mp3" aria-describedby="" name="mp3">
        </div> -->

        <!-- upload de la photo -->
        <!-- <div class="form-group col-md-2">

                <label for="photo">Photo</label>

                <input type="file" class="form-control" id="photo" aria-describedby="" placeholder="" name="photo">

        </div> -->

        




        <!-- le bouton submit -->
        <!-- <button type="submit" class="btn btn-primary">Enregistrer</button>

    </form >

</body> -->

<!-- </html> -->