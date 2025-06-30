document.getElementById('promptForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5000/generate_image', { method: 'HEAD' });
        if (response.ok) {
            document.getElementById('initialDialog').style.display = 'block';
            document.getElementById('loading').style.display = 'flex';
            const prompts = document.getElementById('prompts').value.split(',').map(prompt => prompt.trim()).filter(prompt => prompt!== '');
        } else {
            document.getElementById('errorDialog').style.display = 'block';
            return;
        }
    } catch (error) {
        document.getElementById('errorDialog').style.display = 'block';
        return;
    }
    const response = await fetch('http://localhost:5000/generate_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompts })
    });
    const data = await response.json();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    document.getElementById('loading').style.display = 'none';
    document.getElementById('finishDialog').style.display = 'block';
    data.image_files.forEach((file, index) => {
        const img = document.createElement('img');
        const fileName = file.split('/').pop();
        img.src = `http://localhost:5000/image/${fileName}`;
        img.alt = `Generated Image ${index + 1}`;

        const container = document.createElement('div');
        container.className = 'image-container';
        img.addEventListener('click', () => {
            document.getElementById('enlargedImage').src = img.src;
            document.getElementById('enlargedImageContainer').style.display = 'flex';
        });
        document.getElementById('enlargedImageContainer').addEventListener('click', () => {
            document.getElementById('enlargedImageContainer').style.display = 'none';
        });
        container.appendChild(img);
        resultDiv.appendChild(container);
    });
});