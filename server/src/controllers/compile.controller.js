
export const compileCode = async(req, res) =>{
    try {
        const {language, code} = req.body;

        if(!language || !code){
            return res.status(400).json({message:"Missing fields"});
        }

        const response = await fetch( "https://emkc.org/api/v2/piston/execute",
            {
                method:"POST",
                headers:{
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    language,
                    version:"*",
                    files:[
                        {
                            content:code,
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        res.json({
            output:data.run?.stdout || data.run?.stderr || "No Output",
        });
        
    }catch(err){
        res.status(500).json({message: "Compilation failed"});
    }
};