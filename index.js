const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const cors = require('cors')

const app = express();
app.use(bodyParser.json());
app.use(cors());

const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.post('/generatePrompt', async (req, res) => {
    //getting keywords
    const keywords = req.body.keywords

    //creating prompt from keywords
    const prompt = `generate multiple prompts in detail with long description for text to image for generating cartoon stickers with following keywords (${keywords})`

    //create completion using openai
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
    });

    const resPrompt = completion.data.choices[0].message.content

    //saving prompts in text file
    fs.appendFileSync('promts.txt', `For ${keywords} \n ${resPrompt} \n.\n`);

    res.send(completion.data.choices[0].message);
})

app.post('/generateImage', async (req, res) => {

    const url = "https://stablediffusionapi.com/api/v3/text2img";
    const {prompt} = req.body;
    const reqBody =
    {
        "key": "kz9JsU77145EpNetv8ee9sYIWxxiCpTkIAAJaCr6n1A950W0tUESkiOV9Hbj",
        "prompt": prompt,
        "negative_prompt": "((out of frame)), ((extra fingers)), mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((tiling))), ((tile)), ((fleshpile)), ((ugly)), (((abstract))), blurry, ((bad anatomy)), ((bad proportions)), ((extra limbs)), cloned face, (((skinny))), glitchy, ((extra breasts)), ((double torso)), ((extra arms)), ((extra hands)), ((mangled fingers)), ((missing breasts)), (missing lips), ((ugly face)), ((fat)), ((extra legs)), anime",
        "width": "512",
        "height": "512",
        "samples": "1",
        "num_inference_steps": "20",
        "seed": null,
        "guidance_scale": 7.5,
        "safety_checker": "yes",
        "webhook": null,
        "track_id": null
    }

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: {
            "Content-Type": "application/json"
        }
    })

    const data = await response.json();
    const picId = await data.id;

    const getPic = await fetch(`https://stablediffusionapi.com/api/v3/dreambooth/fetch/${picId}`,{
        method: 'POST',
        body: JSON.stringify({
            "key": "kz9JsU77145EpNetv8ee9sYIWxxiCpTkIAAJaCr6n1A950W0tUESkiOV9Hbj"
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })

    const picRes = await getPic.json();
    res.send(picRes)

})

app.post('/removebg', async (req, res) => {
    const token = "645c8c2421e5d9.59234967"
    const url = "https://api.removal.ai/3.0/remove"
    
})

app.listen(3000, () => {
    console.log("App is running on http://localhost:3000");
})

