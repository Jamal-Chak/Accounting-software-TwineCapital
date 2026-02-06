const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('eslint_out_ascii.json', 'utf8'));
    let errors = [];
    data.forEach(file => {
        file.messages.forEach(msg => {
            if (msg.severity === 2) {
                errors.push({
                    file: file.filePath,
                    line: msg.line,
                    message: msg.message,
                    ruleId: msg.ruleId
                });
            }
        });
    });
    console.log(JSON.stringify(errors.slice(0, 10), null, 2));
} catch (e) {
    console.error(e);
}
