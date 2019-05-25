<?php
// *************************************fonction MEMBRE***********************************

function internauteEstConnecte(){
    // cette fonction vérifie si le membre est connecté
    if(!isset($_SESSION['membre']))
    // si l' indice 'membre' n' est pas défini dans la sesssion, cela signifie que l' internaute n' est pas passé par la page connexion et n' est dopnc pas connecté
        {
            return false;
        }else{
            // si il retourne true, il est donc connecté
            return true;
    }
}

// **********************************fonction ADMIN********************************************

function internauteEstConnecteEstAdmin(){
    // si l' internaute connecté a un statut égal a 1, il est donc administrateur, sinon => membre
    // Cette fonction permettra par la suite de bloquer des pages, des permissions etc...a ceux qui n' en ontpas le droit
    if( internauteEstConnecte() && $_SESSION['membre']['statut'] == 1)
    {   return true;

    }else{
        return false;
    }
}
?>