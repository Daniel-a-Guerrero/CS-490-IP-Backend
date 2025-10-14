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

    listOfUsers
    ,listOfUsersFiltered

    ,addUser
    ,getAddresses
    ,getAddress
    ,getCountries
    ,getCountry
    ,getCities
    ,getCity
    ,getRentalHistory

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

router.get("/customers", listOfUsers)
router.get("/customers/filter", listOfUsersFiltered)

router.post("/customers/insert", (req,res)=>console.log(`${req.body}`))
router.post("/address",(req,res)=>console.log(`${req.body}`))
router.get("/addresses",getAddresses)
router.get("/address/:id",getAddress)
router.get("/countries",getCountries)
router.get("/country/:id",getCountry)
router.get("/cities", getCities)
router.get("/city/:id", getCity)
router.get("/rental/:id", getRentalHistory)

router.delete("/customer/:id",deleteUser)
module.exports = router;