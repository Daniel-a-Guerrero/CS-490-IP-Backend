const express = require("express");
const{
    viewTop5RentedFilms,
    getFilmDetails,
    searchFilmByName,
    searchFilmByActorName,
    searchFilmByGenre,
    viewTop5AStoreActors,
    getActorDetails,
    getTop5RentedFilmsByActor
    ,listOfRentedFilms,
    getUnrentedFilm,
    getUnrentedFilms,
    rentFilm,

    listOfUsers
    ,listOfUsersFiltered

    ,addUser
    ,addAddress
    ,getAddresses
    ,getAddress
    ,getCountries
    ,getCountry
    ,getCities
    ,getCity
    ,getRentalHistory
    ,listOfAllUsers

    ,editUser
    ,deleteUser
} = require("../controllers/filmControllers");
const router = express.Router()

router.get("/top5", viewTop5RentedFilms);
router.get("/details/:film_id", getFilmDetails);
router.get("/search/title/:name", searchFilmByName);
router.get("/search/actor/:fullName" , searchFilmByActorName);
router.get("/search/genre/:genre", searchFilmByGenre);
router.get("/actor/:actor_id", getActorDetails);
router.get("/top5C", viewTop5AStoreActors)
router.get("/top5C/:actor_id", getTop5RentedFilmsByActor)
router.get("/rented", listOfRentedFilms)
router.get("/unrented/:film_id", getUnrentedFilm)
router.get("/unrenteds/:film_id", getUnrentedFilms)
router.post("/rentals",rentFilm)

router.get("/customers", listOfUsers)
router.get("/customers/filter", listOfUsersFiltered)

router.post("/customers/insert", addUser)
router.put("/customer/:id",editUser)
router.get("/allCustomers",listOfAllUsers)
router.post("/address",addAddress)
router.get("/addresses",getAddresses)
router.get("/address/:id",getAddress)
router.get("/countries",getCountries)
router.get("/country/:id",getCountry)
router.get("/cities", getCities)
router.get("/city/:id", getCity)
router.get("/rental/:id", getRentalHistory)

router.delete("/customer/:id",deleteUser)
module.exports = router;