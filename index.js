const dropzone = document.querySelector('.drop-zone');
const fileinput = document.querySelector('#fileinput');
const browsebtn = document.querySelector('.browsebtn');
const bgprogress = document.querySelector('.bg-progress');
const percentdiv = document.querySelector('#percent');
const progressbar = document.querySelector('.progress-bar');
const progresscontainer = document.querySelector('.progress-container');
const fileURLInput = document.querySelector('#fileURL');
const sharingContainer = document.querySelector('.sharing-container');
const copybutton = document.querySelector('#copybtn');
const emailForm = document.querySelector('#emailForm');
const host = "https://innshare.herokuapp.com/"
const uploadURL = `${host}api/files`
const emailURL = `${host}api/files/send`
const toast = document.querySelector('.toast');
const maxallowedsize = 100 * 1024 * 1024;

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault()
    if (!dropzone.classList.contains("dragged")) {
        dropzone.classList.add("dragged")
    }
})

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove("dragged")
})

dropzone.addEventListener('drop', (e) => {
    e.preventDefault()
    dropzone.classList.remove("dragged")
    const files = e.dataTransfer.files;
    if (e.dataTransfer.files.length) {
        fileinput.files = files;
        uploadfile();
    }
})

browsebtn.addEventListener('click', () => {
    fileinput.click();
})

fileinput.addEventListener('change', () => {
    uploadfile();
})

const uploadfile = () => {
    if (fileinput.files.length > 1) {
        showToast("Upload only 1 file!");
        resetFileinput();
        return;
    }
    const file = fileinput.files[0];
    if (file.size > maxallowedsize) {
        showToast("Can't upload more than 100MB!");
        resetFileinput();
        return;
    }
    progresscontainer.style.display = "block";
    const formdata = new FormData();
    formdata.append("myfile", file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response)
            onUploadSuccess(JSON.parse(xhr.response))
        }
    }
    xhr.upload.onprogress = updateProgress;
    xhr.upload.onerror = () => {
        resetFileinput();
        showToast(`Error in upload: ${xhr.statusText}`);
    }

    xhr.open('POST', uploadURL);
    xhr.send(formdata);
}

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    bgprogress.style.width = `${percent}%`
    progressbar.style.transform = `scaleX(${percent / 100})`
    percentdiv.innerText = percent;
}

const onUploadSuccess = ({ file: URL }) => {
    console.log(URL);
    fileinput.value = "";
    emailForm[2].removeAttribute("disabled");
    progresscontainer.style.display = "none";
    sharingContainer.style.display = "block";
    fileURLInput.value = URL;
}

copybutton.addEventListener("click", () => {
    fileURLInput.select();
    document.execCommand("copy");
    showToast("Link copied");
})

emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const url = fileURLInput.value;
    console.log("submit form");
    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    }
    emailForm[2].setAttribute("disabled", "true");
    console.table(formData);

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then(res => res.json()).then(({ success }) => {
        if (success) {
            sharingContainer.style.display = "none";
            showToast("Email Sent");
        }
    }
    )
})

let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%,0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.transform = "translate(-50%,60px)";
    }, 2000)
};

const resetFileinput = () => {
    fileinput.value = "";
}