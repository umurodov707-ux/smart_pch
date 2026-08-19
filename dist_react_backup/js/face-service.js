class FaceService {
    constructor() {
        this.modelsLoaded = false;
        this.isLoading = false;
        this.modelPath = '/models';
        this.labeledDescriptors = [];
    }

    async ensureReady() {
        if (typeof faceapi === 'undefined') {
            if (!window.LazyLoader) {
                throw new Error('Face API kutubxonasi yuklanmagan. Sahifani yangilang.');
            }
            await window.LazyLoader.loadFaceStack();
            return;
        }
        await this.loadModels();
    }

    async loadModels() {
        if (typeof faceapi === 'undefined') {
            throw new Error('face-api kutubxonasi yuklanmagan');
        }
        if (this.modelsLoaded) return;
        if (this.isLoading) {
            // Wait for loading to finish
            while (this.isLoading) {
                await new Promise(r => setTimeout(r, 100));
            }
            return;
        }

        this.isLoading = true;
        try {
            console.log('Loading FaceAPI models...');
            await faceapi.nets.ssdMobilenetv1.loadFromUri(this.modelPath);
            await faceapi.nets.faceLandmark68Net.loadFromUri(this.modelPath);
            await faceapi.nets.faceRecognitionNet.loadFromUri(this.modelPath);
            this.modelsLoaded = true;
            console.log('FaceAPI models loaded successfully.');
        } catch (e) {
            console.error('Error loading FaceAPI models:', e);
            throw e;
        } finally {
            this.isLoading = false;
        }
    }

    // Capture the face descriptor from a video element with auto-retry
    async getDescriptorFromVideo(videoElement) {
        await this.ensureReady();

        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30; // 6 soniya ichida yuzni qidiradi (30 * 200ms = 6000ms)

            const attemptDetection = async () => {
                if (videoElement.readyState < 2) {
                    // Kamera hali to'liq ochilmagan bo'lsa kutish
                    if (++attempts >= maxAttempts) {
                        return reject(new Error("Kamera ochilmadi yoki ruxsat yo'q."));
                    }
                    return setTimeout(attemptDetection, 200);
                }

                try {
                    const detection = await faceapi.detectSingleFace(videoElement)
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (detection && detection.descriptor) {
                        return resolve(detection.descriptor);
                    }
                } catch (e) {
                    console.warn("Face detection frame xatosi:", e);
                }

                attempts++;
                if (attempts >= maxAttempts) {
                    reject(new Error("Yuz topilmadi! Iltimos yorug'lik tushadigan joyga o'ting va kameraga qarang."));
                } else {
                    setTimeout(attemptDetection, 200);
                }
            };

            attemptDetection();
        });
    }

    // Compare two descriptors. Returns a distance (0 to 1). The lower the better.
    // Generally < 0.6 is considered a match for ssdMobilenetv1
    compareDescriptors(descriptor1, descriptor2) {
        if (!descriptor1 || !descriptor2) return 1.0;

        let arr1 = descriptor1;
        let arr2 = descriptor2;

        // Handle parsed JSON which might not be Float32Array
        if (!Array.isArray(arr1) && !(arr1 instanceof Float32Array)) {
            arr1 = Object.values(arr1);
        }
        if (!Array.isArray(arr2) && !(arr2 instanceof Float32Array)) {
            arr2 = Object.values(arr2);
        }

        let sum = 0;
        for (let i = 0; i < arr1.length; i++) {
            sum += Math.pow(arr1[i] - arr2[i], 2);
        }
        return Math.sqrt(sum);
    }
}

window.FaceService = new FaceService();
