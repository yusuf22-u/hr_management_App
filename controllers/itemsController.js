import db from "../config/db.js";
import ExcelJS from "exceljs"
import { cloudinary } from "../utils/cloudinary.js";
export const createItems = async (req, res) => {
  const { item_number, name, physical_location, amount, acquisition_date, description } = req.body;

  // Basic validation
  if (!item_number || !name || !physical_location || !amount || !acquisition_date || !description) {
    return res.status(400).json({ success: false, error: "All fields are required!" });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, error: "Amount must be a positive number!" });
  }

  try {
    let image_url = null;
    if (req.file && req.file.path) {
      image_url = req.file.path;
    }

    // Check if item_number already exists
    const checkQuery = `SELECT * FROM items WHERE item_number = ?`;
    const [existingItem] = await db.query(checkQuery, [item_number]);

    if (existingItem.length > 0) {
      return res.status(409).json({ success: false, error: "Item with this number already exists!" });
    }

    // Insert new item
    const insertQuery = `
      INSERT INTO items (item_number, name, physical_location, amount, acquisition_date, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(insertQuery, [
      item_number,
      name,
      physical_location,
      amount,
      acquisition_date,
      description,
      image_url,
    ]);

    res.status(200).json({
      success: true,
      message: "Item added successfully",
      itemId: result.insertId,
    });
  } catch (err) {
    console.error("Create item error:", err);
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};
export const getAllItems = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get the total count of items
    const [countRows] = await db.query('SELECT COUNT(*) AS totalCount FROM items');
    const totalCount = countRows[0].totalCount;

    // Get the total amount of all items
    const [totalAmountRows] = await db.query('SELECT SUM(amount) AS totalAmount FROM items');
    const totalAmount = totalAmountRows[0].totalAmount || 0; // Ensure it defaults to 0 if null

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Get the paginated items
    const [items] = await db.query('SELECT * FROM items ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);

    res.status(200).json({
      totalCount,
      totalPages,
      currentPage: page,
      totalAmount,  // Added totalAmount field
      items
    });
  } catch (err) {
    res.status(500).json({ error: 'Database query error: ' + err.message });
  }
};

export const getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('SELECT * FROM items WHERE id = ?', [id]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching item', error: err.message });
  }
};

export const deleteItems = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM items WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, error: 'Item not found' });
    }

    res.status(200).json({ status: true, message: 'Item successfully deleted' });
  } catch (err) {
    res.status(500).json({ status: false, error: 'Database query error: ' + err.message });
  }
};

export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, physical_location, amount, acquisition_date, description } = req.body;

  try {
    // 1. Get the existing image_url from the database
    const [existingRows] = await db.query('SELECT image_url FROM items WHERE id = ?', [id]);

    if (existingRows.length === 0) {
      return res.status(404).json({ status: false, error: 'Item not found' });
    }

    let image_url = existingRows[0].image_url;

    // 2. If there's a new image uploaded, delete the old one and set the new image_url
    if (req.file && req.file.path) {
      // Safely delete old image from Cloudinary if it exists
      if (image_url) {
        const publicId = getPublicIdFromUrl(image_url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId); // Deleting the old image from Cloudinary
            console.log(`Old image deleted: ${publicId}`);
          } catch (err) {
            console.warn(`Failed to delete old image (${publicId}):`, err.message);
            // Proceed even if deletion fails
          }
        }
      }

      // Set the new image URL (Multer + CloudinaryStorage automatically uploads to Cloudinary)
      image_url = req.file.path; // 'req.file.path' already contains the URL from Cloudinary
    }

    // 3. Update the item in the database
    const updateQuery = `
      UPDATE items 
      SET name = ?, physical_location = ?, amount = ?, acquisition_date = ?, description = ?, image_url = ?
      WHERE id = ?
    `;

    await db.query(updateQuery, [name, physical_location, amount, acquisition_date, description, image_url, id]);

    res.status(200).json({ status: true, message: 'Item updated successfully' });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ status: false, error: 'Database query error: ' + err.message });
  }
};


// Helper function to extract public ID from Cloudinary URL
function getPublicIdFromUrl(url) {
  try {
    const parts = url.split('/');
    const fileName = parts.pop();
    const publicIdWithExtension = fileName.split('.')[0];
    const uploadIndex = parts.indexOf('upload');
    const folderPath = parts.slice(uploadIndex + 1).join('/');
    return folderPath ? `${folderPath}/${publicIdWithExtension}` : publicIdWithExtension;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}
// controllers/exportController.js

export const exportItemsToExcel = async (req, res) => {
  try {
    // Fetch items directly from your MySQL database
    const [items] = await db.query('SELECT * FROM items'); // adjust table name if needed

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory Report');

    // Add Title
    worksheet.mergeCells('A1', 'I1');
    worksheet.getCell('A1').value = 'Inventory Report';
    worksheet.getCell('A1').font = { size: 18, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add header row
    worksheet.addRow([
     
      'Name',
      'Description',
      'Item Number',
      'Amount (D)',
      'Acquisition Date',
      'Physical Location',
      
    ]);

    // Style header
    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCE5FF' }, // Light blue header
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows dynamically
    items.forEach((item) => {
      worksheet.addRow([
     
        item.name,
        item.description,
        item.item_number,
        parseFloat(item.amount),
        item.acquisition_date ? item.acquisition_date.toISOString().split('T')[0] : '',
        item.physical_location,
        
      ]);
    });

    // Add total amount row
    const totalRow = worksheet.addRow(['', '', '', 'Total Amount:', totalAmount]);
    totalRow.getCell(4).font = { bold: true };
    totalRow.getCell(5).font = { bold: true };
    totalRow.getCell(5).numFmt = '"D"#,##0.00';

    // Auto width for all columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 12 ? 12 : maxLength + 2;
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting inventory:', error);
    res.status(500).json({ message: 'Failed to export inventory.' });
  }
};
