// Helper function to get direct Google Drive image URL
const getDirectGoogleDriveImageUrl = (imageUrlJson: string | null | undefined, defaultImage: string): string => {
  // If null or undefined, return default
  if (!imageUrlJson) {
    return defaultImage;
  }

  try {
    // Handle different formats of input
    let viewUrl = "";
    
    if (typeof imageUrlJson === 'string') {
      // Case 1: Direct Google Drive URL
      if (imageUrlJson.includes('drive.google.com/file/d/')) {
        viewUrl = imageUrlJson;
      } 
      // Case 2: JSON string with image1 key
      else if (imageUrlJson.includes('{"image1"')) {
        try {
          const parsed = JSON.parse(imageUrlJson) as { image1?: string };
          viewUrl = parsed.image1 || '';
        } catch (parseError) {
          console.error("Failed to parse JSON string:", imageUrlJson);
          return defaultImage;
        }
      }
      // Case 3: Plain text URL that's not a Google Drive link
      else {
        // If it's a valid URL but not Google Drive, return as is
        if (imageUrlJson.startsWith('http') || imageUrlJson.startsWith('https')) {
          return imageUrlJson;
        }
        return defaultImage;
      }
    } else if (typeof imageUrlJson === 'object' && imageUrlJson !== null) {
      // Case 4: Already parsed object with image1 property
      const imageObj = imageUrlJson as { image1?: string };
      viewUrl = imageObj.image1 || '';
    } else {
      // Case 5: Unhandled type
      return defaultImage;
    }

    // No valid URL found
    if (!viewUrl || typeof viewUrl !== 'string') {
      return defaultImage;
    }

    // Extract file ID from viewUrl (e.g., https://drive.google.com/file/d/FILE_ID/view?usp=...)
    const match = viewUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (match && match[1]) {
      const fileId = match[1];
      
      // Try multiple formats that might bypass CORS issues
      // Format 1: Direct image embedding (most reliable)
      return `https://lh3.googleusercontent.com/d/${fileId}`;
      
      // If the above doesn't work, you can try these alternatives:
      // Format 2: Original export=view (might have CORS issues)
      // return `https://drive.google.com/uc?export=view&id=${fileId}`;
      
      // Format 3: Through the thumbnail API (usually works but lower quality)
      // return `https://drive.google.com/thumbnail?id=${fileId}`;
    }

    // If it's a URL but not a Google Drive URL, return as is
    if (viewUrl.startsWith('http') || viewUrl.startsWith('https')) {
      return viewUrl;
    }

    // If format is different or extraction fails, return default
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

  try {
    let parsedImages: Record<string, string> = {};
    
    // Parse the JSON if it's a string
    if (typeof imageUrlJson === 'string') {
      try {
        // Check if it's a JSON string with multiple images
        if (imageUrlJson.includes('{"image1"')) {
          parsedImages = JSON.parse(imageUrlJson);
        } else {
          // If it's just a single URL, return it processed
          return [getDirectGoogleDriveImageUrl(imageUrlJson, defaultImage)];
        }
      } catch (parseError) {
        console.error("Failed to parse JSON string:", imageUrlJson);
        return [defaultImage];
      }
    } else if (typeof imageUrlJson === 'object' && imageUrlJson !== null) {
      // If it's already an object
      parsedImages = imageUrlJson as Record<string, string>;
    } else {
      return [defaultImage];
    }

    // Process all image URLs in the object
    const imageUrls: string[] = [];
    
    // Get all keys that start with "image" and process them
    Object.keys(parsedImages)
      .filter(key => key.startsWith('image'))
      .sort() // Sort to ensure image1 comes first, then image2, etc.
      .forEach(key => {
        const url = parsedImages[key];
        if (url && typeof url === 'string') {
          // Process each URL to get direct link
          const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
          if (match && match[1]) {
            const fileId = match[1];
            imageUrls.push(`https://lh3.googleusercontent.com/d/${fileId}`);
          } else if (url.startsWith('http') || url.startsWith('https')) {
            imageUrls.push(url);
          }
        }
      });

    // If no valid images were found, return default
    return imageUrls.length > 0 ? imageUrls : [defaultImage];
  } catch (error) {
    console.error(`Error processing multiple image URLs: ${imageUrlJson}`, error);
    return [defaultImage];
  }
};

export default getDirectGoogleDriveImageUrl;
export { getAllGoogleDriveImages };
