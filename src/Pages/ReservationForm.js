// Find the handleSubmit function and modify it to make sure dates are formatted correctly
const handleSubmit = (e) => {
  e.preventDefault()
  
  // Formatear los datos antes de enviarlos
  const formattedData = {
    startDate: formatDate(formData.startDate),
    startTime: formData.startTime,
    endDate: formatDate(formData.endDate),
    endTime: formData.endTime,
    quantity: parseInt(formData.quantity, 10),
    cityStartId: parseInt(formData.cityStartId, 10),
    cityEndId: parseInt(formData.cityEndId, 10)
  }

  // Log the formatted data to verify values
  console.log('Reservation form data (formatted):', formattedData);

  // Llamar a la función onSubmit que contiene la lógica del SweetAlert
  onSubmit(formattedData)
} 