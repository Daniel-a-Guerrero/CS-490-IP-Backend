const {query} = require('../database');

//  Landing Page:

//get film details
const getFilmDetails = async (req,res) => {
    try {
        const {film_id} = req.params;
        const item = await query(`
            SELECT f.* 
            FROM sakila.film f 
            WHERE f.film_id = ?`, [film_id]);
        res.status(200).json(item[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//view top 5 rented films of all times
const viewTop5RentedFilms = async (req,res) => {
    try {
        const items = await query(`
            SELECT
                f.film_id,
                f.title,
                COUNT(*)       AS rental_count
                FROM sakila.rental    r
                    JOIN sakila.inventory i              ON i.inventory_id = r.inventory_id
                    JOIN sakila.film      f              ON f.film_id = i.film_id
                GROUP BY f.film_id, f.title
                ORDER BY rental_count DESC
                LIMIT 5;
            `);
        res.status(200).json({items});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//view top 5 actors at the store
const viewTop5AStoreActors = async (req,res)=>{
    try{
        const items = await query(`
            select a.actor_id, a.first_name, a.last_name , COUNT(fa.film_id) AS cuenta
            from sakila.film_actor as fa
            left join sakila.actor as a
            on a.actor_id = fa.actor_id 
            group by a.actor_id  
            order by COUNT(fa.film_id) desc
            LIMIT 5;`);
            res.status(200).json({items})
        }catch (error) {
            res.status(500).json({ message: error.message });
        }
}

//Get actor info and their top 5 rented films
const getActorDetails = async (req, res) => {
    try {
        const { actor_id } = req.params;
        const actor = await query(`SELECT a.actor_id, a.first_name , a.last_name, COUNT(fa.film_id) film_count
FROM sakila.actor a
join sakila.film_actor fa on a.actor_id = fa.actor_id
where a.actor_id = ?
group by a.actor_id
            `, [actor_id]);
        if (actor.length === 0) {
            return res.status(404).json({ message: 'Actor not found' });
        }
        const films = await query(`
            SELECT f.film_id, f.title, COUNT(r.rental_id) AS rental_count
            FROM sakila.film f
            JOIN sakila.film_actor fa ON fa.film_id = f.film_id
            JOIN sakila.rental r ON r.inventory_id IN (
                SELECT i.inventory_id
                FROM sakila.inventory i
                WHERE i.film_id = f.film_id 
            )
            WHERE fa.actor_id = ?
            GROUP BY f.film_id, f.title
            ORDER BY rental_count DESC
            LIMIT 5;
        `, [actor_id]);
        res.status(200).json({ actor: actor[0], topFilms: films });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//View top 5 rented films for a specific actor
const getTop5RentedFilmsByActor = async (req, res) => {
    try {
        const { actor_id } = req.params;
        const items = await query(`
            SELECT f.film_id, f.title, COUNT(r.rental_id) AS rental_count
            FROM sakila.film f
            JOIN sakila.film_actor fa ON fa.film_id = f.film_id
            JOIN sakila.rental r ON r.inventory_id IN (
                SELECT i.inventory_id
                FROM sakila.inventory i
                WHERE i.film_id = f.film_id 
            )
            WHERE fa.actor_id = ?
            GROUP BY f.film_id, f.title
            ORDER BY rental_count DESC
            LIMIT 5;
        `, [actor_id]);
        res.status(200).json({ items });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//Films Page:

//As a user I want to be able to search a film by name of film, name of an actor, or genre of the film
const searchFilmByName = async (req,res) => {
    try {
        const {name} = req.params;
        const item = await query(`SELECT * FROM sakila.film WHERE title = ?`, [name.toUpperCase()
        ]);
        res.status(200).json({item});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const searchFilmByActorName = async (req,res) => {
    try {
        const fullName = req.params.fullName;
        const nameParts = fullName.split(' ');
        const {aName, aSurnname} = {aName: nameParts[0], aSurnname: nameParts[1]};
            console.log(aName);
            console.log(aSurnname);
        const item = await query(`
            SELECT f.*, a.first_name, a.last_name
            FROM sakila.film f
            JOIN sakila.film_actor fa ON fa.film_id = f.film_id
            JOIN sakila.actor a ON a.actor_id = fa.actor_id
            WHERE a.first_name = ? AND a.last_name = ?`
            , [aName , aSurnname]);
        res.status(200).json({item});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const searchFilmByGenre = async (req,res) => {
    try {
        const {genre} = req.params;
        const item = await query(`
            SELECT f.*, c.name
            FROM sakila.film f
            JOIN sakila.film_category fc ON fc.film_id = f.film_id
            JOIN sakila.category c ON c.category_id = fc.category_id
            WHERE c.name = ?`
            , [genre]);
        res.status(200).json({item});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const listOfRentedFilms = async (req,res) => {
    try {
        const items = await query(`SELECT 
    f.film_id,
    f.title,
    COUNT(DISTINCT i.inventory_id) AS total_copies,
    COUNT(DISTINCT CASE WHEN r.return_date IS NULL THEN i.inventory_id END) AS rented_copies
FROM sakila.film AS f
JOIN sakila.inventory AS i ON f.film_id = i.film_id
LEFT JOIN sakila.rental AS r ON i.inventory_id = r.inventory_id 
    AND r.rental_id = (
        SELECT rental_id 
        FROM sakila.rental 
        WHERE inventory_id = i.inventory_id 
        ORDER BY rental_date DESC 
        LIMIT 1
    )
GROUP BY f.film_id, f.title
HAVING COUNT(DISTINCT i.inventory_id) = 
       COUNT(DISTINCT CASE WHEN r.return_date IS NULL THEN i.inventory_id END)
ORDER BY f.film_id;;`);
        res.status(200).json({items});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Get a single film based on the film id that isn't currently rented out
const getUnrentedFilm=async (req,res)=>{
    try {
        const {film_id} = req.params;
        const item = await query(`
            select i.*
from sakila.inventory i
where i.film_id =?
and i.inventory_id not in
(select i_sub.inventory_id
                from sakila.rental r_sub
                join sakila.inventory i_sub on r_sub.inventory_id = i_sub.inventory_id
                where r_sub.return_date is null
                order by i_sub.film_id)
order by i.film_id
limit 1`, [film_id]);
        res.status(200).json(item[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 
const getUnrentedFilms=async (req,res)=>{
    try {
        const {film_id} = req.params;
        const item = await query(`
            select i.*
from sakila.inventory i
where i.film_id =?
and i.inventory_id not in
(select i_sub.inventory_id
                from sakila.rental r_sub
                join sakila.inventory i_sub on r_sub.inventory_id = i_sub.inventory_id
                where r_sub.return_date is null
                order by i_sub.film_id)
order by i.film_id`, [film_id]);
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 

/*const rentFilm=async(req,res)=>{
    try{
        const {film_id}=req.params;
        const item = await query(`
            INSERT
            `)
    }
}*/

//Customer Page:

const listOfUsers = async (req, res) => {
    /*console.log("Recc: ",req.query)
       console.log('req.url:', req.url);
       console.log('req.originalUrl:', req.originalUrl);
    // Parse and validate pagination parameters*/
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    
    // Ensure they're valid positive integers, set defaults if not
    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = 10;
    
    // Cap the limit to prevent abuse
    limit = Math.min(limit, 100);
    
    const offset = (page - 1) * limit;
    
    //console.log(`Inside page ${page}, limit ${limit}, offset ${offset}`);
    //console.log(`SELECT * FROM sakila.customer LIMIT ? OFFSET ?`, [limit, offset]);
    
    try {
        //const items = await query(`SELECT * FROM sakila.customer LIMIT ? OFFSET ?`, [limit, offset]);
            const items = await query(`SELECT * FROM sakila.customer LIMIT ${limit} OFFSET ${offset}`);
        
        // Optionally get total count for pagination metadata
        const countResult = await query('SELECT COUNT(*) as total FROM sakila.customer');
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        res.status(200).json({
            items,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
    //filter/search customers by their customer id, first name or last name
const listOfUsersFiltered = async (req, res) => {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    
    // Accept both customerId and customerID (case-insensitive)
    let customerIdRaw = req.query.customerId || req.query.customerID;
    let customerId = customerIdRaw ? Number(customerIdRaw) : null;
    
    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1) limit = 10;
    
    // Cap the limit to prevent abuse
    limit = Math.min(limit, 100);
    const offset = (page - 1) * limit;
    
    let firstName = req.query.firstName?.trim();
    if(firstName!==undefined){
    firstName="\""+firstName+"\" "}
    let lastName = req.query.lastName?.trim();
    if(lastName!==undefined){
    lastName="\""+lastName+"\" "}
    
    try {
        console.log("Filters - customerIdRaw:", customerIdRaw, "customerId:", customerId, typeof customerId, "First Name:", firstName, "Last Name:", lastName, "Limit:", limit, typeof limit, "Offset:", offset, typeof offset);
        
        let baseQuery = 'SELECT * FROM sakila.customer WHERE 1=1';
        let queryParams = [];
        
        // More robust customerId check
        if (customerId && Number.isInteger(customerId) && customerId > 0) {
            baseQuery += ` AND customer_id = ${customerId}`;
            console.log("Added")
        }
        
        // More robust string checks
        if (firstName && firstName.length > 0) {
            baseQuery += ` AND first_name = ${firstName}`;
            //queryParams.push(firstName.toUpperCase());
        }
        
        if (lastName && lastName.length > 0) {
            baseQuery += ` AND last_name = ${lastName}`;
            //queryParams.push(lastName.toUpperCase());
        }
        
        baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;
        queryParams.push(limit, offset); // Remove Number() wrapper
        
        console.log("Final Query:", baseQuery, queryParams);
        console.log("Param types:", queryParams.map(p => typeof p));
        
        const items = await query(baseQuery, queryParams);
        res.status(200).json({ 
            items, 
            pagination: { 
                currentPage: page, 
                itemsPerPage: limit 
            } 
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addUser = async (req,res) =>{
    const {store_id,first_name,last_name,email,address_id,active}=req.body
    if(!store_id||!first_name||!last_name||!email||!address_id||!active){
        return res.status(400).send("Incomplete user form")
    }
    try{
        const item = await query(`
            INSERT INTO sakila.customer 
            (store_id,first_name,last_name,email,address_id,active,create_date,last_update)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `,[store_id,first_name,last_name,email,address_id,active])
            res.status(200).json({item});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAddresses=async(req,res)=>{
    try{
        const item=await query(`
            SELECT * from sakila.address`)
        res.status(200).json({item});
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}
const getAddress=async(req,res)=>{
    try{
        let {id}=req.params
        const item=await query(`
            SELECT * from sakila.address where address_id = ?`,[id])
        res.status(200).json(item[0]);
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}

const addAddress = async (req,res)=>{
    const {address,address2,district,city_id,postal_code,phone,location}=req.body
    if(!address,!address2,!district,!city_id,!postal_code,!phone,!location){
        return res.status(400).send("Incomplete address form")
    }
    try{
        const item = await query(`
            INSERT INTO sakila.address
            (address,address2,district,city_id,postal_code,phone,location,last_update)
            VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)
            `,[address,address2,district,city_id,postal_code,phone,location])
            res.status(200).json({item});
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

const getCountries = async(req,res)=>{
    try{
        console.log("Leprechaun",(req.query))
        const item = await query(`
            SELECT * from sakila.country
            `)
            res.status(200).json({item});
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}
const getCountry = async(req,res)=>{
    let {id}=req.params
        console.log(req.params)
    try{
        console.log(id)
        const item = await query(`
            SELECT * from sakila.country WHERE country_id = ?
            `,[id])
            res.status(200).json(item[0]);
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}

const getCities = async(req,res)=>{
    try{
        const item = await query(`
            SELECT * from sakila.city
            `)
            res.status(200).json({item});
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}
const getCity = async(req,res)=>{
    let {id}=req.params
    try{
        console.log(id)
        const item = await query(`
            SELECT * from sakila.city WHERE city_id = ?
            `,[id])
            res.status(200).json(item[0]);
    }
    catch (error){
        res.status(500).json({message: error.message})
    }
}
/**/const getRentalHistory=async(req,res)=>{
    let {id}=req.params
    try{
        const item = await query(`
            select r.*, f.title
            from sakila.rental r
            join sakila.inventory i
            on r.inventory_id=i.inventory_id
            join sakila.film f on  i.film_id=f.film_id
            where customer_id=?`,[id]);
            res.status(200).json(item);
    }
    catch(error){res.status(500).json({message: error.message})}
}

const editUser = async (req,res)=>{
    try {
        const { customer_id } = req.params;
        const { store_id, first_name, last_name, email, address_id, active } = req.body;

        if (!customer_id || !store_id || !first_name || !last_name || !email || !address_id || active === undefined) {
            return res.status(400).json({ message: "Incomplete data" });
        }

        const result = await query(
            `UPDATE sakila.customer
             SET store_id = ?, first_name = ?, last_name = ?, email = ?, address_id = ?, active = ?, last_update = CURRENT_TIMESTAMP
             WHERE customer_id = ?`,
            [store_id, first_name, last_name, email, address_id, active, customer_id]
        );

        res.status(200).json({ message: "User updated", result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteUser = async(req,res)=>{
    try{
        const {id} = req.params
        console.log(id)
        const item = await query(`DELETE FROM sakila.customer WHERE customer_id=?`,[id])
        res.status(200).json(item);
    } catch (error) {
        console.log(req.params)
        res.status(500).json({ message: error.message });
    }
}
module.exports = { 
    viewTop5RentedFilms,
    getFilmDetails,
    viewTop5AStoreActors
    //,getActorDetails
    ,getActorDetails,
    getTop5RentedFilmsByActor,
    searchFilmByName,
    searchFilmByActorName,
    searchFilmByGenre,
    listOfRentedFilms,
    getUnrentedFilm,
    getUnrentedFilms,

    listOfUsers,
    listOfUsersFiltered,

    addUser,
    getAddresses,
    getAddress,
    getCountries,
    getCountry,
    getCities,
    getCity,
    getRentalHistory,

    deleteUser
};