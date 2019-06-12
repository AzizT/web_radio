<?php
// *************************************************************session

session_start();

// **************************************************************connexion bdd
$bdd = new PDO('mysql:host=localhost;dbname=web-radio', 'root', '', array(PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING, PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));



// *******************************************************chemin************************************************

define("RACINE_SITE", $_SERVER['DOCUMENT_ROOT'] . '/web_radio/mw_radio/');
// Lors de l' enregistrement d' image/photos, nous aurons besoin du chemin physique complet, pour enregistrer la photo dans le bon dossier (lui filer celui du chemin global, celui ou se situait l' index supprimé depuis)
// echo RACINE_SITE;

define("URL", "http://localhost/web_radio/mw_radio/");
// echo URL;
// cette constante servira entre autre a enregistrer l' URL d' une photo / image dans la bdd. On ne conserve jamais la photo en elle même, ce serait trop lourd pourla bdd

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