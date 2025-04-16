import db from "../config/db.js";



export const createItems = (req, res) => {
  const { name, category, quantity, description } = req.body;

  // Validation for required fields
  if (!name || !category || !quantity || !description) {
    return res.status(400).json({ success: false, error: "All fields are required!" });
  }

  // Additional check: quantity should be a positive number
  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ success: false, error: "Quantity must be a positive number!" });
  }

  const image_url = req.file ? req.file.filename : null;

  const sql = `INSERT INTO items (name, category, quantity, description, image_url)
                 VALUES(?,?,?,?,?)`;

  const values = [
    name,
    category,
    quantity,
    description,
    image_url,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: "Server error", err });
    }
    res.status(200).json({ success: true, message: "Item added successfully" });
  });
}
export const getAllItems = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Query to count the total number of items
  const countQuery = 'SELECT COUNT(*) AS totalCount FROM items';
  
  // Query to retrieve paginated items
  const itemQuery = 'SELECT * FROM items LIMIT ? OFFSET ?';

  db.query(countQuery, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database count query error: ' + err });
    }

    const totalCount = countResult[0].totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    db.query(itemQuery, [limit, offset], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database query error: ' + err });
      }

      res.json({
        totalCount,
        totalPages,
        currentPage: page,
        items: result
      });
    });
  });
};

export const deleteItems = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM items WHERE id=?'
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ Status: false, error: "query error" + err })
    }
    if (result.length === 0) {
      return res.status(404).json({ status: false, error: 'no record found' });
    }
    return res.json({ Status: true, msg: "Item is successfully deleted" })
  })
}
export const getItemById = (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM items WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching items data', error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'item not found' });
    }

    return res.status(200).json(result[0]); // Return the item data
  });
};

export const updateItem = (req, res) => {
  const { id } = req.params;  // Get item ID from the route
  const { name, category, quantity, description } = req.body;  // Extract data from the request body

  // Fetch the old image URL
  const oldpicQuery = `SELECT image_url FROM items WHERE id = ?`;
  db.query(oldpicQuery, [id], (err, result) => {
    if (err) {
      console.error('Database query error while fetching item:', err);
      return res.status(500).json({ status: false, error: 'Database query error: ' + err });
    }
    if (result.length === 0) {
      return res.status(404).json({ status: false, error: 'Item not found' });
    }

    // Get the existing image URL from the database
    const existingImageUrl = result[0].image_url;

    // Default to the old image URL; if there's a new file, update it
    let image_url = existingImageUrl;
    if (req.file) {
      image_url = req.file.filename;  // Replace with new image file if uploaded
    }

    // SQL query to update the item
    const updateQuery = `
      UPDATE items
      SET name = ?, category = ?, quantity = ?, description = ?, image_url = ?
      WHERE id = ?
    `;

    // Update the item with new data
    db.query(updateQuery, [name, category, quantity, description, image_url, id], (err, result) => {
      if (err) {
        console.error('Database query error while updating item:', err);
        return res.status(500).json({ status: false, error: 'Database query error: ' + err });
      }

      res.json({ status: true, message: 'Item updated successfully' });
    });
  });
};
