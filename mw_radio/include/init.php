<?php
// **************************************************************connexion bdd
$bdd = new PDO('mysql:host=localhost;dbname=mw_radio', 'root', '', array(PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING, PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));

// *************************************************************session

session_start();
// *********************************************qlq variables*************************************************
$error1 = '';
$error = '';
// message d' erreur
$validate = '';
// message de validation
$content = '';
// nous permettra de placer du contenu si' on le souhaite


//  ***********************************************************Failles XSS****************

// POST
// pour proteger les formulaires
foreach($_POST as $key => $value)
{
    $_POST[$key] = strip_tags(trim($value));
}
// le strip_tags supprime les balises html et le trim supprime les espaces en début et fin de chaine

// GET
// pour proteger l' URL, qui peut subir une injection comme le formulaire
foreach ($_GET as $key => $value) {
        $_GET[$key] = strip_tags(trim($value));
    }

// ********************************************INCLUSIONS***************************

// on inclut directement le fichier fonction.php dans le init. Cela évitera de l' appeler sur chaque page
require_once("fonction.php");

?>