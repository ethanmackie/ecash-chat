import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appConfig } from '@/config/app';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UploadIcon, Cross1Icon } from "@radix-ui/react-icons";
import { AttachmentIcon, Upload2Icon } from "@/components/ui/social";

const FileUpload = ({ maxFileSizeBytes, setIsFileSelected, setFileSelected }) => {
  const fileInputRef = React.useRef(null);
  const [fileSize, setFileSize] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const sizeInBytes = file.size;

      if (file.name.split('.').pop() !== 'mp3') {
        setError(`Only mp3 file types are supported`);
        setFileSize(null);
      } else if (sizeInBytes > maxFileSizeBytes) {
        setError(`File size exceeds the limit of ${appConfig.ipfsAudioSizeLimitMb} MB`);
        setFileSize(null);
      } else {
        setError(null);
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        setFileSize(sizeInKB + ' KB');
        setIsFileSelected(true);
        setFileSelected(file);
      }
    }
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileSize(null);
    setError(null);
  };

  return (
    <Card>
      <CardHeader className="flex-row flex items-center space-y-0">
        <Badge variant="outline" className="h-12 justify-center w-12 px-0 rounded-full mr-4"><UploadIcon/></Badge>
        <div>
          <CardTitle className="text-lg font-semibold">Upload Your Podcast to IPFS</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-muted rounded-lg h-52 px-2 flex flex-col items-center justify-center">
          <Badge variant="outline" className="h-12 justify-center w-12 px-0 shadow-lg"><Upload2Icon/></Badge>
          <p className="text-sm font-semibold mb-4 mt-4">Supported file type: .mp3</p>
          <p className="text-sm text-muted-foreground mb-4">Maximum size: 50MB</p>
          <Button variant="outline" onClick={handleButtonClick}>Choose File</Button>
          {error && <p className="text-red-500 mt-2 mb-2 text-sm">{error}</p>}
        </div>
      </CardContent>
      <CardFooter>
        <div className={`flex items-center w-full justify-between p-4 border-2 border-muted rounded-lg h-18 px-2 ${!fileSize ? 'hidden' : ''}`}>
          <div className="flex-shrink-0">
            <Badge variant="ghost" className="h-12 justify-center w-12 px-0 border-none"><AttachmentIcon/></Badge>
          </div>
          <div className="flex-grow px-2">
            <Input
              type="file"
              ref={fileInputRef}
              accept=".mp3"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500 mt-2">{fileSize ? `File size: ${fileSize}` : 'Upload your file'}</p>
          </div>
          <div className="flex-shrink-0">
            <Button variant="ghost" onClick={handleClearFile}><Cross1Icon/></Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export { FileUpload };