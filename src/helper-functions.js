async function requestProbabilities (data) {
    const url = 'https://us-central1-uplifted-air-257404.cloudfunctions.net/camel_up_calculator';
    
    console.log(data)
    return {
        "computational_duration": 0.8581066131591797,
        "probs": [
            {
                "green": 0.15199,
                "yellow": 0.13752,
                "white": 0.11351,
                "orange": 0.27329,
                "blue": 0.3237
            },
            {
                "orange": 0.22421,
                "white": 0.15326,
                "yellow": 0.10638,
                "green": 0.2607,
                "blue": 0.25545
            },
            {
                "blue": 0.19475,
                "green": 0.26986,
                "white": 0.21183,
                "orange": 0.20665,
                "yellow": 0.11691
            },
            {
                "yellow": 0.18759,
                "orange": 0.16101,
                "blue": 0.1406,
                "white": 0.28179,
                "green": 0.22901
            },
            {
                "white": 0.23961,
                "blue": 0.08549,
                "green": 0.08844,
                "yellow": 0.45161,
                "orange": 0.13484
            }
        ]
    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data), 
            headers: { 'Content-Type': 'application/json' }
        })
        const json = await response.json()
        console.log('Success:', JSON.stringify(json))
        return json
    } catch (error) {
        console.error('Error:', error)
    }
}

export default requestProbabilities