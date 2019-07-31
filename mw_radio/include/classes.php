<?php
class membre{

    private $nom;
    private $prenom;
    private $pseudo;
    private $email;
    private $mdp;
    private $error;

    public function setNom($nom)
    {

    }

    public function getNom()
    {
        return $this->nom;
    }

    public function setPrenom($prenom)
    { 

    }

    public function getPrenom()
    {
        return $this->prenom;
    }

    public function setPseudo($pseudo)
    { 

    }
    public function getPseudo()
    {
        return $this->pseudo;
    }

    public function setEmail($email)
    { 

    }
    public function getEmail()
    {
        return $this->email;
    }

    public function setMdp($mdp)
    { 

    }

    public function getMdp()
    {
        return $this->mdp;
    }


}
class album{

    private $nom;
    private $annee;
    private $photo;
    private $genre1;
    private $genre2;
    private $musicien1;
    private $musicien2;
    private $musicien3;
    private $musicien4;
    private $musicien5;
    private $musicien6;
    private $error;

    public function setNom($nom)
    {
        if (is_string($nom)) {
            $this->nom = $nom;
        } else {
            $this->error = "ce n' est pas un string !";
            return $this->error;
        }
    }

    public function getNom()
    {
        return $this->nom;
    }

    public function setAnnee($annee)
    {
        if (is_integer($annee)) {
            $this->annee = $annee;
        } else {
            $this->error = "ce n' est pas un nombre !";
            return $this->error;
        }
    }

    public function getAnnee()
    {
        return $this->annee;
    }

    public function setPhoto($photo)
    { 

    }

    public function getPhoto()
    {
        return $this->photo;
    }

    public function setGenre1($genre1)
    { 

    }

    public function getGenre1()
    {
        return $this->genre1;
    }

    public function setGenre2($genre2)
    { 

    }

    public function getGenre2()
    {
        return $this->genre2;
    }

    public function setMusicien1($musicien1)
    { 

    }

    public function getMusicien1()
    {
        return $this->musicien1;
    }

    public function setMusicien2($musicien2)
    { 

    }

    public function getMusicien2()
    {
        return $this->musicien2;
    }

    public function setMusicien3($musicien3)
    { 

    }

    public function getMusicien3()
    {
        return $this->musicien3;
    }

    public function setMusicien4($musicien4)
    { 

    }

    public function getMusicien4()
    {
        return $this->musicien4;
    }

    public function setMusicien5($musicien5)
    { 

    }

    public function getMusicien5()
    {
        return $this->musicien5;
    }

    public function setMusicien6($musicien6)
    { 

    }

    public function getMusicien6()
    {
        return $this->musicien6;
    }

}
class track{

    private $titre;
    private $idAlbum;
    private $mp3;
    private $langue1;
    private $langue2;
    private $error;

    public function setTitre($titre)
    {

    }

    public function getTitre()
    {
        return $this->titre;
    }

    public function setIdAlbum($idAlbum)
    { 

    }

    public function getIdAlbum()
    {
        return $this->idAlbum;
    }

    public function setMp3($mp3)
    { 

    }

    public function getMp3()
    {
        return $this->mp3;
    }

    public function setLangue1($langue1)
    { 

    }

    public function getLangue1()
    {
        return $this->langue1;
    }

    public function setLangue2($langue2)
    { 

    }

    public function getLangue2()
    {
        return $this->langue2;
    }

}
?>