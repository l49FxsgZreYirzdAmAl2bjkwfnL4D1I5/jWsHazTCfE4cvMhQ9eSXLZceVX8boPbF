document.getElementById('uploadForm').addEventListener('submit', async e => {
  e.preventDefault()
  const formData = new FormData()
  const fileInput = e.target.querySelector('input[name="media"]')
  formData.append('media', fileInput.files[0])

  const res = await fetch('/upload', {
    method: 'POST',
    body: formData
  })

  const data = await res.json()
  alert('Processed frames: ' + data.frames)
})
