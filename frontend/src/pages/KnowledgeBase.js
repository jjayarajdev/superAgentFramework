import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { documentsAPI } from '../api';
import { format } from 'date-fns';

const fileIcons = {
  'application/pdf': <PdfIcon />,
  'text/plain': <FileIcon />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <FileIcon />,
};

const UploadZone = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setProgress(0);

      try {
        await onUpload(acceptedFiles[0], (percent) => {
          setProgress(percent);
        });
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        borderRadius: 3,
        p: 6,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? 'primary.50' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'primary.50',
        },
      }}
    >
      <input {...getInputProps()} />
      <UploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
      {uploading ? (
        <Box>
          <Typography variant="h6" gutterBottom>
            Uploading...
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 300, mx: 'auto', mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {progress}%
            </Typography>
          </Box>
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop the file here' : 'Drag & drop a document here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supports PDF, TXT, and DOCX files
          </Typography>
        </>
      )}
    </Box>
  );
};

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsAPI.getAll,
  });

  const uploadMutation = useMutation({
    mutationFn: (data) => documentsAPI.upload(data.file, data.onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: documentsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleUpload = async (file, onProgress) => {
    await uploadMutation.mutateAsync({ file, onProgress });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredDocuments = React.useMemo(() => {
    if (!documents) return [];
    if (!searchTerm) return documents;

    return documents.filter((doc) =>
      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Knowledge Base
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload documents for RAG-powered agent context
              </Typography>
            </Box>
          </Box>
          {documents && documents.length > 0 && (
            <Chip
              label={`${documents.length} document${documents.length !== 1 ? 's' : ''}`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Upload Zone */}
      <Box sx={{ mb: 4 }}>
        <UploadZone onUpload={handleUpload} />
      </Box>

      {/* Search */}
      {documents && documents.length > 0 && (
        <TextField
          fullWidth
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load documents: {error.message}
        </Alert>
      )}

      {/* Upload Error */}
      {uploadMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => uploadMutation.reset()}>
          Upload failed: {uploadMutation.error.message}
        </Alert>
      )}

      {/* Documents List */}
      {filteredDocuments && filteredDocuments.length > 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Uploaded Documents ({filteredDocuments.length})
            </Typography>
            <List>
              {filteredDocuments.map((doc) => (
                <ListItem key={doc.id} divider>
                  <ListItemIcon>
                    {fileIcons[doc.content_type] || <FileIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.filename}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Typography variant="caption" component="span">
                          {doc.file_size
                            ? `${(doc.file_size / 1024).toFixed(2)} KB`
                            : 'Unknown size'}
                        </Typography>
                        {doc.created_at && (
                          <Typography variant="caption" component="span">
                            Uploaded {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ) : (
        !isLoading && (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No documents uploaded
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload PDFs, text files, or Word documents to power your agents with knowledge
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                >
                  Upload Your First Document
                </Button>
              </Box>
            </CardContent>
          </Card>
        )
      )}
    </Box>
  );
};

export default KnowledgeBase;
