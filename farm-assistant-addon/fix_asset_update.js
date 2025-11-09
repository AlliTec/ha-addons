// Corrected asset update function to match AssetCreate model

const assetData = {
    // Basic Information
    name: formData.get('name'),
    category: formData.get('category'),
    make: formData.get('make'),
    model: formData.get('model'),
    serial_number: formData.get('serial_number'),
    
    // Status & Location
    location: formData.get('location'),
    quantity: formData.get('quantity') ? parseInt(formData.get('quantity')) : 1,
    status: formData.get('status'),
    parent_asset_id: formData.get('parent_asset_id') ? parseInt(formData.get('parent_asset_id')) : null,
    
    // Purchase Information
    purchase_date: formData.get('purchase_date') || null,
    purchase_price: formData.get('purchase_price') ? parseFloat(formData.get('purchase_price')) : null,
    purchase_location: formData.get('purchase_location'),
    warranty_provider: formData.get('warranty_provider'),
    warranty_expiry_date: formData.get('warranty_expiry_date') || null,
    
    // Registration & Insurance
    registration_no: formData.get('registration_no'),
    registration_due: formData.get('registration_due') || null,
    insurance_info: formData.get('insurance_info'),
    insurance_due: formData.get('insurance_due') || null,
    
    // Permits & Documentation
    permit_info: formData.get('permit_info'),
    manual_or_doc_path: formData.get('manual_or_doc_path'),
    
    // Usage Information
    usage_type: formData.get('usage_type'),
    usage_value: formData.get('usage_value') ? parseFloat(formData.get('usage_value')) : null,
    usage_notes: formData.get('usage_notes'),
    
    // General Notes
    notes: formData.get('notes')
};