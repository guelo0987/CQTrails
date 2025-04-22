// Helper function to get direct Google Drive image URL
const getDirectGoogleDriveImageUrl = (imageUrlJson: string | null | undefined, defaultImage: string): string => {
  // Case 1: If null, undefined, or empty string, return default image
  if (!imageUrlJson || (typeof imageUrlJson === 'string' && imageUrlJson.trim() === '')) {
    return defaultImage;
  }
  
  let viewUrl = '';
  
  try {
    // Case 2: Handle string type input
    if (typeof imageUrlJson === 'string') {
      // Case 2.1: Direct Google Drive URL
      if (imageUrlJson.includes('drive.google.com/file/d/')) {
        viewUrl = imageUrlJson;
      }
      // Case 2.2: JSON string containing image URLs
      else if (imageUrlJson.includes('{') && imageUrlJson.includes('}')) {
        try {
          const parsed = JSON.parse(imageUrlJson) as Record<string, string>;
          
          // Find the first key that starts with 'image'
          const imageKey = Object.keys(parsed).find(key => 
            key.toLowerCase().startsWith('image'));
          
          if (imageKey && parsed[imageKey]) {
            viewUrl = parsed[imageKey];
          }
        } catch (jsonError) {
          console.error("Failed to parse JSON string:", imageUrlJson, jsonError);
          // If parsing fails, try using it as a direct URL
          viewUrl = imageUrlJson;
        }
      }
      // Case 2.3: Direct http/https URL
      else if (imageUrlJson.startsWith('http') || imageUrlJson.startsWith('https')) {
        return imageUrlJson;
      }
      // Case 2.4: Unrecognized string format
      else {
        console.warn(`Unrecognized image URL format: ${imageUrlJson}`);
        return defaultImage;
      }
    } 
    // Case 3: Handle object type input
    else if (typeof imageUrlJson === 'object' && imageUrlJson !== null) {
      // Cast to record type
      const imageObj = imageUrlJson as Record<string, string>;
      
      // Find the first key that starts with 'image'
      const imageKey = Object.keys(imageObj).find(key => 
        key.toLowerCase().startsWith('image'));
      
      if (imageKey && imageObj[imageKey]) {
        viewUrl = imageObj[imageKey];
      } else {
        console.warn("No image key found in image object:", imageObj);
        return defaultImage;
      }
    }
    // Case 4: Unhandled type
    else {
      console.warn(`Unhandled image URL type: ${typeof imageUrlJson}`);
      return defaultImage;
    }
    
    // Process Google Drive URL to get file ID
    let fileId = '';
    
    if (viewUrl.includes('drive.google.com')) {
      // Extract file ID from Google Drive URL formats
      if (viewUrl.includes('/file/d/')) {
        // Format: https://drive.google.com/file/d/FILE_ID/view
        const match = viewUrl.match(/\/file\/d\/([^\/]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      } else if (viewUrl.includes('id=')) {
        // Format: https://drive.google.com/open?id=FILE_ID
        const match = viewUrl.match(/id=([^&]+)/);
        if (match && match[1]) {
          fileId = match[1];
        }
      } else {
        console.warn(`Unrecognized Google Drive URL format: ${viewUrl}`);
        return defaultImage;
      }
      
      // If we successfully extracted a file ID
      if (fileId) {
        // Try both formats to ensure cross-browser compatibility
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    }
    
    // If viewUrl is not a Google Drive URL but a valid URL, return it directly
    if (viewUrl && (viewUrl.startsWith('http') || viewUrl.startsWith('https'))) {
      return viewUrl;
    }
    
    // If no valid URL could be processed, return default
    return defaultImage;
    
  } catch (error) {
    console.error(`Error processing image URL: ${imageUrlJson}`, error);
    return defaultImage;
  }
};

// Helper to get all images from a JSON object containing multiple Google Drive links
const getAllGoogleDriveImages = (imageUrlJson: string | null | undefined, defaultImage: string): string[] => {
  if (!imageUrlJson) {
    return [defaultImage];
  }
  
  let parsedImages: Record<string, string> = {};
  
  try {
    // Handle string input
    if (typeof imageUrlJson === 'string') {
      // If it looks like a JSON string, try to parse it
      if (imageUrlJson.includes('{') && imageUrlJson.includes('}')) {
        try {
          parsedImages = JSON.parse(imageUrlJson);
        } catch (e) {
          // If parsing fails, treat it as a single URL
          return [getDirectGoogleDriveImageUrl(imageUrlJson, defaultImage)];
        }
      } else {
        // If it's not JSON, treat as a single URL
        return [getDirectGoogleDriveImageUrl(imageUrlJson, defaultImage)];
      }
    } 
    // Handle object input
    else if (typeof imageUrlJson === 'object' && imageUrlJson !== null) {
      // Cast to proper type
      parsedImages = imageUrlJson as Record<string, string>;
    } else {
      console.warn(`Unhandled image URL type: ${typeof imageUrlJson}`);
      return [defaultImage];
    }
    
    // Get all keys starting with 'image' and sort them
    const imageKeys = Object.keys(parsedImages)
      .filter(key => key.toLowerCase().startsWith('image'))
      .sort();
    
    // Process each image URL
    const imageUrls: string[] = [];
    
    for (const key of imageKeys) {
      const url = parsedImages[key];
      
      // Skip empty URLs
      if (!url) continue;
      
      // Process Google Drive URLs
      if (url.includes('drive.google.com')) {
        let fileId = '';
        
        if (url.includes('/file/d/')) {
          const match = url.match(/\/file\/d\/([^\/]+)/);
          if (match && match[1]) {
            fileId = match[1];
          }
        } else if (url.includes('id=')) {
          const match = url.match(/id=([^&]+)/);
          if (match && match[1]) {
            fileId = match[1];
          }
        }
        
        if (fileId) {
          imageUrls.push(`https://lh3.googleusercontent.com/d/${fileId}`);
        } else {
          imageUrls.push(url);
        }
      } 
      // Handle direct URLs
      else if (url.startsWith('http') || url.startsWith('https')) {
        imageUrls.push(url);
      }
    }
    
    return imageUrls.length > 0 ? imageUrls : [defaultImage];
    
  } catch (error) {
    console.error(`Error processing multiple image URLs: ${imageUrlJson}`, error);
    return [defaultImage];
  }
};

export { getAllGoogleDriveImages };
export default getDirectGoogleDriveImageUrl;
