async function requestProbabilities (data) {
    const url = 'https://us-central1-uplifted-air-257404.cloudfunctions.net/camel_up_calculator';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data), 
            headers: { 'Content-Type': 'application/json' }
        })
        const json = await response.json()
        return json
    } catch (error) {
        console.error('Error:', error)
    }
}

export default requestProbabilities