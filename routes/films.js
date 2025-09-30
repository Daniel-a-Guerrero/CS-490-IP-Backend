const express = require("express");
const{
    viewTop5RentedFilms,
    getFilmDetails,
    searchFilmByName,
    searchFilmByActorName,
    searchFilmByGenre,
    viewTop5AStoreActors,
    getTop5RentedFilmsByActor
    ,listOfRentedFilms
    ,listOfUsers
    ,listOfUsersFiltered
} = require("../controllers/filmControllers");
const router = express.Router()

router.get("/top5", viewTop5RentedFilms);
router.get("/details/:film_id", getFilmDetails);
router.get("/search/title/:name", searchFilmByName);
router.get("/search/actor/:fullName" , searchFilmByActorName);
router.get("/search/genre/:genre", searchFilmByGenre);
router.get("/top5C", viewTop5AStoreActors)
router.get("/top5C/:actor_id", getTop5RentedFilmsByActor)
router.get("/rented", listOfRentedFilms)
router.get("/customers" , listOfUsers)
router.get("/customers/filter", listOfUsersFiltered)
module.exports = router;