const { Sequelize, DataTypes } = require('sequelize');

const conexaoBancoDeDados = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const express = require('express') 
const cors = require('cors') 
const portaServidorBackend = 4050
const app = express()

app.use(express.json())
app.use(cors({
    origin: '*',
    allowedHeaders: '*'
}))

app.listen(portaServidorBackend, () => {
    console.log('backend iniciado')
})

const Perguntas = conexaoBancoDeDados.define('perguntas', {
    id: {
        type: DataTypes.INTEGER,  
        autoIncrement: true, 
        primaryKey: true,    
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    enunciado: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

const Alternativas = conexaoBancoDeDados.define('alternativas', {
    id: {
        type: DataTypes.INTEGER,  
        autoIncrement: true, 
        primaryKey: true,    
    },
    alternativa: {
        type: DataTypes.STRING,
        allowNull: false
    },
    enunciado: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// 🔗 Relacionamento Alternativas → Perguntas
Alternativas.belongsTo(Perguntas, {
    foreignKey: {
        name: 'perguntaId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});
Perguntas.hasMany(Alternativas, { foreignKey: 'perguntaId' });

// 🔗 Relacionamento Perguntas → Alternativa Correta
Perguntas.belongsTo(Alternativas, {
    as: 'alternativaCorreta',
    foreignKey: {
        name: 'alternativaCorretaId',
        allowNull: true
    },
    onDelete: 'CASCADE'
});

// 🟢 Criar Pergunta com alternativas
app.post('/perguntas', async (req, res) => {
    try {
        const { titulo, enunciado, alternativas, alternativaCorreta } = req.body;

        if (!titulo || !enunciado || !alternativas || !alternativaCorreta) {
            return res.status(400).json({ erro: 'Dados incompletos' });
        }

        const pergunta = await Perguntas.create({ titulo, enunciado });

        const alternativasCriadas = await Promise.all(
            alternativas.map(async (alt) => {
                return await Alternativas.create({
                    alternativa: alt.alternativa.toUpperCase(),
                    enunciado: alt.enunciado,
                    perguntaId: pergunta.id
                });
            })
        );

        const alternativaCorretaEncontrada = alternativasCriadas.find(
            alt => alt.alternativa.toUpperCase() === alternativaCorreta.toUpperCase()
        );

        if (!alternativaCorretaEncontrada) {
            return res.status(400).json({ erro: 'alternativaCorreta inválida' });
        }

        await pergunta.update({ alternativaCorretaId: alternativaCorretaEncontrada.id });

        res.json({
            pergunta,
            alternativas: alternativasCriadas,
            alternativaCorreta: alternativaCorretaEncontrada
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao criar pergunta' });
    }
});

// 🔵 Listar todas as Perguntas
app.get('/perguntas', async (req, res) => {
    const perguntas = await Perguntas.findAll({
        include: [
            { model: Alternativas },
            { model: Alternativas, as: 'alternativaCorreta' }
        ]
    });
    res.json(perguntas);
});

// 🔵 Buscar uma Pergunta por ID
app.get('/perguntas/:id', async (req, res) => {
    const pergunta = await Perguntas.findByPk(req.params.id, {
        include: [
            { model: Alternativas },
            { model: Alternativas, as: 'alternativaCorreta' }
        ]
    });
    if (!pergunta) {
        return res.status(404).json({ erro: 'Pergunta não encontrada' });
    }
    res.json(pergunta);
});

// 🟠 Atualizar Pergunta
app.put('/perguntas/:id', async (req, res) => {
    try {
        const { titulo, enunciado, alternativaCorretaId } = req.body;
        const pergunta = await Perguntas.findByPk(req.params.id);

        if (!pergunta) return res.status(404).json({ erro: 'Pergunta não encontrada' });

        await pergunta.update({ titulo, enunciado, alternativaCorretaId });

        res.json(pergunta);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar' });
    }
});

// 🔴 Deletar Pergunta
app.delete('/perguntas/:id', async (req, res) => {
    const pergunta = await Perguntas.findByPk(req.params.id);
    if (!pergunta) return res.status(404).json({ erro: 'Pergunta não encontrada' });

    await pergunta.destroy();
    res.json({ mensagem: 'Pergunta deletada' });
});

// 🟢 Criar Alternativa para uma Pergunta existente
app.post('/alternativas', async (req, res) => {
    const { perguntaId, alternativa, enunciado } = req.body;
    try {
        const pergunta = await Perguntas.findByPk(perguntaId);
        if (!pergunta) return res.status(404).json({ erro: 'Pergunta não encontrada' });

        const novaAlternativa = await Alternativas.create({ perguntaId, alternativa, enunciado });
        res.json(novaAlternativa);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar alternativa' });
    }
});

// 🔴 Deletar Alternativa
app.delete('/alternativas/:id', async (req, res) => {
    const alternativa = await Alternativas.findByPk(req.params.id);
    if (!alternativa) return res.status(404).json({ erro: 'Alternativa não encontrada' });

    await alternativa.destroy();
    res.json({ mensagem: 'Alternativa deletada' });
});

// Sincronizar tabelas
(async () => {
    await conexaoBancoDeDados.sync();
    console.log('Banco sincronizado.');
})();
